#!/bin/bash

USERNAME=${SUDO_USER:-$USER}
APP_DIR="/home/$USERNAME/DisplayHub/pi-server"

echo "Which Desktop are you using ? lxde or wayland ?"
echo "1) lxde"
echo "2) wayland"
read -p "Select an option [1-2]: " option
case $option in
    1)
        echo "Installing for lxde"
        sudo apt-get update
        sudo apt-get install -y chromium-browser unclutter

        cd /home/$USERNAME/.config
        sudo mkdir -p lxsession/LXDE-pi
        cd lxsession/LXDE-pi
        cat << 'EOF' > autostart
        @lxpanel --profile LXDE-pi
        @pcmanfm --desktop --profile LXDE-pi
        @xscreensaver -no-splash
        @xset s off
        @xset -dpms
        @xset s noblank

        @unclutter -idle 0.1 -root

        @chromium-browser --start-fullscreen --kiosk --autoplay-policy=no-user-gesture-required --app=http://client.displayhub.fr
EOF
        ;;
    2)
        echo "Installing for wayland"
        sudo apt-get update
        sudo apt-get install -y chromium-browser
        WAYFIRE_CONFIG="/home/$USERNAME/.config/wayfire.ini"

        if ! grep -q "\[autostart\]" "$WAYFIRE_CONFIG"; then
            cat << 'EOF' >> $WAYFIRE_CONFIG

[autostart]
#panel = wfrespawn wf-panel-pi
#background = wfrespawn pcmanfm --desktop --profile LXDE-pi
xdg-autostart = lxsession-xdg-autostart
chromium = chromium-browser https://client.displayhub.fr --kiosk --noerrdialogs --disable-infobars --no-first-run --ozone-platform=wayland --enable-features=OverlayScrollbar --start-maximized --autoplay-policy=no-user-gesture-required
switchtab = bash ~/switchtab.sh
screensaver = false
dpms = false
EOF
        fi

        rm -f /usr/share/rpd-wallpaper/fisherman.jpg
        cp $APP_DIR/public/elements/background.png /usr/share/rpd-wallpaper/fisherman.jpg

        sudo apt install -y interception-tools interception-tools-compat
        sudo apt install -y cmake
        cd /home/$USERNAME
        git clone https://gitlab.com/interception/linux/plugins/hideaway.git
        cd hideaway
        cmake -B build -DCMAKE_BUILD_TYPE=Release
        cmake --build build
        sudo cp /home/$USERNAME/hideaway/build/hideaway /usr/bin
        sudo chmod +x /usr/bin/hideaway
        cd /home/$USERNAME
        wget https://raw.githubusercontent.com/ugotapi/wayland-pagepi/main/config.yaml
        sudo cp /home/$USERNAME/config.yaml /etc/interception/udevmon.d/config.yaml
        sudo systemctl restart udevmon
        ;;
    *)
        echo "Invalid option"
        ;;
esac

CONFIG_FILE="/etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf"

if [ -f "$CONFIG_FILE" ]; then
    sudo sed -i 's/show_trash=1/show_trash=0/' "$CONFIG_FILE"
    sudo sed -i 's/show_mounts=1/show_mounts=0/' "$CONFIG_FILE"
else
    echo "Le fichier $CONFIG_FILE n'existe pas."
fi

cd $APP_DIR

sudo systemctl disable bluetooth
sudo systemctl stop bluetooth

sudo chown -R $USERNAME:$USERNAME $APP_DIR
sudo -u $USERNAME npm install

sudo -u $USERNAME cp .env.example .env
NEW_CLIENT_URL="https://client.displayhub.fr"
sed -i "s|^CLIENT_URL=.*|CLIENT_URL=${NEW_CLIENT_URL}|"  .env

echo "Configuration du fichier sudoers pour $USERNAME..."

sudo bash -c "cat <<EOL >> /etc/sudoers
$USERNAME ALL=(ALL) NOPASSWD: /sbin/shutdown, /sbin/reboot
EOL"

echo "Création d'un service systemd..."

sudo bash -c "cat <<EOL > /etc/systemd/system/pi-server.service
[Unit]
Description=Pi Server
After=network.target

[Service]
ExecStart=/usr/bin/node $APP_DIR/pi-server.js
WorkingDirectory=$APP_DIR
Restart=on-failure
RestartSec=10
User=$USERNAME
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=NODE_ENV=production
Environment=PORT=3002
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pi-server

[Install]
WantedBy=multi-user.target
EOL"

sudo systemctl daemon-reload
sudo systemctl enable pi-server.service
sudo systemctl start pi-server.service