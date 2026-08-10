#!/bin/bash
cd /home/bezito/.openclaw/workspace/web/bez-ambar
TOKEN=$(node -e "process.stdout.write(require(require('os').homedir()+'/.openclaw/credentials/vercel.json').token)")
TEAM="team_dAXeuKkw0zXf2cPo5UwF0C7X"
PRJ="prj_YIYwbBNqU7GFLwpuzWNlwGiZx475"
curl -s "https://api.vercel.com/v6/deployments?projectId=$PRJ&teamId=$TEAM&limit=1&target=production" -H "Authorization: Bearer $TOKEN" > /tmp/pa.json
node -e "const j=require('/tmp/pa.json');const dp=j.deployments[0];console.log('prod sha:',((dp.meta&&dp.meta.githubCommitSha)||'').slice(0,7),'| state:',dp.state)"
echo "=== redesign markers on live /blog ==="
curl -s -A "Mozilla/5.0" "https://bezambar-nextjs.vercel.app/blog" > /tmp/blog.html
grep -oE "masthead|feature|The Journal|Latest" /tmp/blog.html | sort | uniq -c
echo "post links:"
grep -oE "/blog/[a-z0-9-]+" /tmp/blog.html | sort -u | wc -l
