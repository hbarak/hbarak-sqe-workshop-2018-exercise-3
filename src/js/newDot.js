function dot(nodes) {
    const output = ['digraph cfg { ']; //forcelabels=true
    addNodes(nodes, output);
    addEdges(nodes, output);
    output.push(' }');
    return output.join('');
}

function addNodes(nodes, output){
    for (const [i, node] of nodes.entries()) {
        output.push(`n${i} [label="(${i+1})\n${node.label}" `);
        if (node.marked)
            output.push(' style = filled fillcolor = green');
        let shape = 'box';
        if (node.true || node.false)
            shape = 'diamond';
        output.push(` shape="${shape}"]\n`);

    }
}

function addEdges(nodes, output){
    for (const [i, node] of nodes.entries()) {
        for (const type of ['normal', 'true', 'false']) {
            const next = node[type];
            if (!next) continue; //return?
            output.push(`n${i} -> n${nodes.indexOf(next)} [`);
            if (['true', 'false'].includes(type)) output.push(`label="${type.charAt(0).toUpperCase()}"`);
            output.push(']\n');
        }
    }
}

export {dot};