cd $HOME/p/alarmclock
git stash
git pull
cd docker
./bld
cd ..

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
$HOME/p/alarmclock/src/autostart /etc/xdg/lxsession/LXDE-pi
$HOME/p/alarmclock/src/pi.desktop $HOME/.config/autostart
!

a=$HOME/p/alarmclock/src/crontab
b=/tmp/mclock.crontab
crontab -l >$b
if $(diff $a $b >/dev/null)
then
  echo $a is up to date
else
  echo installing new version of $a
  crontab -r
  crontab $a
fi
