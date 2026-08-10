#!/bin/bash
# Pull the real Plytix keys from Vercel into .env.local so local probe is valid.
cd /home/bezito/.openclaw/workspace/web/bez-ambar
node -e "process.stdout.write(require(require('os').homedir()+'/.openclaw/credentials/vercel.json').token)" > /tmp/vt.txt
TOKEN=$(cat /tmp/vt.txt)
TEAM="team_dAXeuKkw0zXf2cPo5UwF0C7X"
PRJ="prj_YIYwbBNqU7GFLwpuzWNlwGiZx475"
for KEY in PLYTIX_API_KEY PLYTIX_API_PASSWORD; do
  curl -s "https://api.vercel.com/v9/projects/$PRJ/env?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" > /tmp/envs.json
  ID=$(KEY="$KEY" node -e "const j=require('/tmp/envs.json');const e=(j.envs||[]).find(x=>x.key===process.env.KEY&&(x.target||[]).includes('preview'))||(j.envs||[]).find(x=>x.key===process.env.KEY);process.stdout.write(e?e.id:'')")
  curl -s "https://api.vercel.com/v1/projects/$PRJ/env/$ID?teamId=$TEAM" -H "Authorization: Bearer $TOKEN" > /tmp/enval.json
  VAL=$(node -e "const j=require('/tmp/enval.json');process.stdout.write(j.value||'')")
  grep -q "^$KEY=" .env.local && sed -i "/^$KEY=/d" .env.local
  echo "$KEY=$VAL" >> .env.local
  echo "$KEY: ${#VAL} chars"
done
