#!/bin/bash
cd /home/bezito/.openclaw/workspace/web/bez-ambar
TOKEN=$(node -e "process.stdout.write(require(require('os').homedir()+'/.openclaw/credentials/vercel.json').token)")
TEAM="team_dAXeuKkw0zXf2cPo5UwF0C7X"
DPL="$1"
for i in $(seq 1 40); do
  curl -s "https://api.vercel.com/v13/deployments/$DPL?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" > /tmp/dp.json
  ST=$(node -e "const j=require('/tmp/dp.json');console.log((j.readyState||j.status)+'|'+(j.target||''))")
  echo "poll $i: $ST"
  case "$ST" in
    READY*) break;;
    ERROR*|CANCELED*) break;;
  esac
  sleep 15
done
