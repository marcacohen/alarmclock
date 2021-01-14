cd $HOME/p/alarmclock
git fetch spotify
git reset --hard
docker/bld

while read a b
do
  if $(diff $a $b >/dev/null)
  then
    echo $a is up to date
  else
    echo installing new version of $a
    sudo cp $a $b
  fi
done <<!
autostart /etc/xdg/lxsession/LXDE-pi
pi.desktop $HOME/.config/autostart
!

crontab -l >/tmp/mclock.crontab
a=$HOME/p/alarmclock/src/crontab
b=$(crontab -l)
if $(diff $a $b >/dev/null)
  then
    echo $a is up to date
  else
    echo installing new version of $a
    crontab -r
    crontab $a
  fi
done <<!
