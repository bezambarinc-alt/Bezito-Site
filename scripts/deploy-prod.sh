#!/bin/bash
set -e
cd /home/bezito/.openclaw/workspace/web/bez-ambar
TOKEN=$(node -e "process.stdout.write(require(require('os').homedir()+'/.openclaw/credentials/vercel.json').token)")
TEAM="team_dAXeuKkw0zXf2cPo5UwF0C7X"
PRJ="prj_YIYwbBNqU7GFLwpuzWNlwGiZx475"
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"bezambar-nextjs","project":"'"$PRJ"'","target":"production","gitSource":{"type":"github","org":"bezambarinc-alt","repo":"Bezito-Site","ref":"feat/nextjs-migration","repoId":1203530611}}' \
  > /tmp/dep.json
node -e "const j=require('/tmp/dep.json');console.log('id:',j.id||j.uid,'| state:',j.readyState||j.status,'| sha:',((j.meta&&j.meta.githubCommitSha)||'').slice(0,7),'| err:',j.error?JSON.stringify(j.error):'none')"
