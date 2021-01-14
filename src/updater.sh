cd $HOME/p/alarmclock
git fetch
git reset --hard
docker/bld

exit 0

FILES="autostart: pi.desktop: docker/chromium-*:"
for i in FILES
do
  if $(diff $i  >/dev/null); then echo same; else echo diff; fi
done

crontab
