# Raspberry AutoLoader

Download unclutter
```bash
sudo apt-get install unclutter
```

Create .config/lxsession/LXDE-pi/autostart to run the script on boot
```bash
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash

@xset s off
@xset -dpms
set s noblank

@unclutter -idle 0.1

@chromium-browser --start-fullscreen --kiosk --app=https://client.displayhub.fr
```
