import $ from 'jquery';
import {parseCodeWithRange} from './code-analyzer';
import {generateGraph, createEnv, paintPath} from './graph-evaluator';
import {dot} from './newDot';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';

// const esgraph = require('esgraph');

const string = (x)=>{
    return JSON.stringify(x);
};

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        //get + parse code
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCodeWithRange(codeToParse);
        $('#parsedCode').val(string(parsedCode));
        const cfgNodes = generateGraph(parsedCode); //init cfg + env by args' values
        let values = getValues();
        let env = createEnv(parsedCode.body[0],values);
        paintPath(cfgNodes[0],env); //paint path by env
        //dot + digraph
        let output = dot(cfgNodes);
        let svg = new Viz({Module, render});
        let graph = document.getElementById('output');
        svg.renderSVGElement(output).then(function(element){
            graph.innerHTML = '';
            graph.append(element);
        });
    });
});

function getValues() {
    let input = $('#input').val();
    let ans = [];
    for(let i=0; i<input.length; i++){
        //window.alert(input[i]);
        i = extracted(i, input, ans);
    }
    return ans;
}

function extracted(i, input, ans) {
    for (let j = i + 1; j < input.length + 1; j++) {
        if (j === input.length || input[j] === ',') {
            let param = input.slice(i, j);
            ans.push(JSON.parse(param));

            i = j;
            break;
        }
        if (input[i] === '[') {
            j = extracted2(input, j);
        }
    }
    return i;
}

function extracted2(input, j) {
    for (; input[j] !== ']'; j++) ;
    return j;
}


