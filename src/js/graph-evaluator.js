import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';
import {parseCodeWithRange} from './code-analyzer';
let Parser = require('expr-eval').Parser;
const parser = new Parser();


/*******************************GRAPH CREATION************************************/

function generateGraph(parsedCode){
    let nodes = createNodes(parsedCode);
    return nodes;
}

function createNodes(parsedCode) {
    //get all nodes from cfg
    let nodes = esgraph(parsedCode.body[0].body)[2];

    //remove entry and exit
    nodes = nodes.slice(1, nodes.length - 1);
    nodes[0].prev = [];
    nodes.filter(node => node.astNode.type === 'ReturnStatement')
        .forEach(node => {node.next=[]; delete node.normal;});

    //label nodes
    nodes.forEach(node => node.label =
        (node.astNode.type === 'AssignmentExpression' || node.astNode.type === 'UpdateExpression')?
            escodegen.generate(node.astNode) + ';':
            escodegen.generate(node.astNode));

    //merge suited nodes
    mergeRegNodes(nodes);
    return nodes;
}

function mergeRegNodes(nodes) {
    for (let i = 0; i < nodes.length; i++) {
        let currNode = nodes[i], nextNode = currNode.normal;
        if (nextNode && nextNode.normal && nextNode.next.length !== 0) {
            nodes.splice(nodes.indexOf(nextNode), 1);
            currNode.label += ` \n ${nextNode.label}`;
            currNode.next = nextNode.next;
            currNode.normal = nextNode.normal;
            i--;
        }
    }
}



/*********************GRAPH EVALUATION*****************************/
function createEnv(parsedFunction, values) {
    let env = {};
    let params = parsedFunction.params;
    for (let i = 0; i < params.length; i++) {
        // if (params[i].type === 'ArrayExpression') {
        //     env[params[i].object.name] = values[i];
        // } else {
        env[params[i].name] = values[i];
        // }
    }
    return env;
}

function paintPath(first,env ){
    let currNode = first;
    while (currNode.next.length !== 0) {
        currNode.marked = true;
        if (currNode.normal) {
            evaluateCode(parseCodeWithRange(currNode.label), env);
            currNode = currNode.normal;
        }
        else if (evaluateCode(parseCodeWithRange(currNode.label).body[0], env)) {
            currNode = currNode.true;
        } else {
            currNode = currNode .false;
        }
    }
    currNode.marked = true;
}


function evaluateCode(exp, env){
    return handlers[exp.type](exp, env);
}

function evaluateAtomic(exp, env){
    return atomicHandlers[exp.type](exp, env);
}

const handlers = {
    'BlockStatement': body,
    'Program': body,
    'AssignmentExpression': function (exp, env) {
        let left = exp.left, right = exp.right;
        if (left.type === 'MemberExpression') {
            env[left.object.name][left.property.value] = evaluateAtomic(right, env);
        } else {
            env[left.name] = evaluateAtomic(right, env);
        }
        return true;
    },
    'ExpressionStatement': function (exp, env) {
        return evaluateCode(exp.expression, env);
    },
    'VariableDeclaration': function (exp, env) {
        for (let i = 0; i < exp.declarations.length; i++) {
            let declarator = exp.declarations[i];
            // if (declarator.init !== null) {
            env[declarator.id.name] = evaluateAtomic(declarator.init, env);
            // }
        }
        return true;
    },
    'UpdateExpression': function (exp,env){
        env[exp.argument.name] = evaluateAtomic(exp,env);
    },
    'BinaryExpression': operator,
};

const atomicHandlers = {
    'Identifier': function (exp, env) {
        return env[exp.name];
    },
    'Literal': function (exp, env) {
        env.toString();
        return exp.value;
    },
    'ArrayExpression': function(exp, env){
        let x= eval('[' + exp.elements.map(arg => evaluateAtomic(arg, env)).join(',') + ']');
        return x;
    },
    'MemberExpression': function (exp, env) {
        return env[exp.object.name][exp.property.value];
    },
    'UpdateExpression': function (exp,env){
        return exp.operator === '++' ?
            parser.evaluate(env[exp.argument.name] + '+1'):
            parser.evaluate(env[exp.argument.name] + '-1');
    },
    'BinaryExpression': operator,
    'LogicalExpression': operator,
};

function operator(exp, env) {
    return parser.evaluate(evaluateAtomic(exp.left, env)
        + exp.operator
        + evaluateAtomic(exp.right, env));
}

function body(exp,env){
    for (let i = 0; i < exp.body.length; i++) {
        evaluateCode(exp.body[i], env);
        // window.alert(exp.body.length);
    }

    return true;
}

export {generateGraph, createEnv, paintPath};