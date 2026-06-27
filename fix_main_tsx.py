import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

search_block = """  const handleVote = async (id: string, weight: number) => {
    if (!identity) return;
    try {
        await fetch('http://127.0.0.1:1337/dao/vote', {"""

replace_block = """  const handleVote = async (id: string, weight: number) => {
    if (!identity) return;
    try {
        const signature = await signVotePayload(id, identity.dht_key, weight, identity.private_key);
        await fetch('http://127.0.0.1:1337/dao/vote', {"""

content = content.replace(search_block, replace_block)

search_block_2 = """            body: JSON.stringify({
                proposal_id: id,
                voter_id: identity.dht_key,
                weight
            })"""

replace_block_2 = """            body: JSON.stringify({
                proposal_id: id,
                voter_id: identity.dht_key,
                weight,
                signature
            })"""

content = content.replace(search_block_2, replace_block_2)

with open('src/main.tsx', 'w') as f:
    f.write(content)
