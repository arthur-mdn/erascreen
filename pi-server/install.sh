#!/bin/bash

# ask for the raspberry desktop
echo "Which Desktop are you using ? lxde or wayland ?"
echo "1) lxde"
echo "2) wayland"
read -p "Select an option [1-2]: " option
case $option in
    1)
        echo "Installing for lxde"
        sudo apt-get update
        sudo apt-get install -y chromium-browser unclutter

        cd .config
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
        cat << 'EOF' > wayfire.ini
        [autostart]
        panel = wfrespawn wf-panel-pi
        background = wfrespawn pcmanfm --desktop --profile LXDE-pi
        xdg-autostart = lxsession-xdg-autostart
        chromium = chromium-browser https://client.displayhub.fr --kiosk --noerrdialogs --disable-infobars --no-first-run --ozone-platform=wayland --enable-features=OverlayScrollbar --start-maximized --autoplay-policy=no-user-gesture-required
        switchtab = bash ~/switchtab.sh
        screensaver = false
        dpms = false
EOF
        sudo apt install -y interception-tools interception-tools-compat
        sudo apt install -y cmake
        cd ~
        git clone https://gitlab.com/interception/linux/plugins/hideaway.git
        cd hideaway
        cmake -B build -DCMAKE_BUILD_TYPE=Release
        cmake --build build
        sudo cp /home/$USER/hideaway/build/hideaway /usr/bin
        sudo chmod +x /usr/bin/hideaway
        cd ~
        wget https://raw.githubusercontent.com/ugotapi/wayland-pagepi/main/config.yaml
        sudo cp /home/$USER/config.yaml /etc/interception/udevmon.d/config.yaml
        sudo systemctl restart udevmon

        ;;
    *)
        echo "Invalid option"
        ;;
esac


sudo apt install -y git nodejs npm

case $option in
    1)
        pcmanfm --set-wallpaper ~/DisplayHub/pi-server/background.jpg
        ;;
    2)
        cd ~
        gsettings set org.gnome.desktop.background picture-uri 'DisplayHub/pi-server/background.jpg'
        gsettings set org.gnome.desktop.background picture-uri-dark 'DisplayHub/pi-server/background.jpg'

        ;;
    *)
        echo "Invalid option"
        ;;
esac

npm install

echo "Configuration du fichier sudoers pour $USER..."

sudo bash -c "cat <<EOL >> /etc/sudoers
$USER ALL=(ALL) NOPASSWD: /sbin/shutdown, /sbin/reboot
EOL"

echo "Création d'un service systemd..."
APP_DIR="/home/$USER/DisplayHub/pi-server"

sudo bash -c "cat <<EOL > /etc/systemd/system/pi-server.service
[Unit]
Description=Pi Server
After=network.target

[Service]
ExecStart=/usr/bin/node $APP_DIR/pi-server.js
WorkingDirectory=$APP_DIR
Restart=on-failure
RestartSec=10
User=$USER
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=NODE_ENV=production
Environment=PORT=3002
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pi-server

[Install]
WantedBy=multi-user.target
EOL"

sudo systemctl daemon-reload
sudo systemctl enable pi-server.service
sudo systemctl start pi-server.service

sudo reboot
