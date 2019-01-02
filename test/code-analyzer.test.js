import assert from 'assert';
import {parseCode, parseCodeWithRange} from '../src/js/code-analyzer';
import {generateGraph, createEnv, paintPath} from '../src/js/graph-evaluator';
import {dot} from '../src/js/newDot';

describe('The javascript parser', () => {
    // it('is parsing an empty function correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('')),
    //         '{"type":"Program","body":[],"sourceType":"script"}'
    //     );
    // });
    //
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
    //     );
    // });
});




describe('The createEnv function', () => {
    it('is parsing  parameters, atomic and array, correctly', () => {
        let params = ['1','2',[1,2]];
        let code ='function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    return c;\n' +
            '}';
        assert.equal(
            JSON.stringify(createEnv(parseCodeWithRange(code).body[0], params)),
            '{"x":"1","y":"2","z":[1,2]}'
        );
    });

});




describe('The generateGraph function', () => {
    it('is generating correct nodes', () => {
        let code = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '\n' +
            '    \n' +
            '    return c;\n' +
            '}';
        let nodes = generateGraph(parseCodeWithRange(code));
        assert.equal(
            dot(nodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x + 1; \n let b = a + y; \n let c = 0;\"  shape=\"box\"]\nn1 [label=\"(2)\nreturn c;\"  shape=\"box\"]\nn0 -> n1 []\n }'
        );
    });

    it('is generating correct nodes', () => {
        let code = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    \n' +
            '    while (b < z) {\n' +
            '        b++;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}';
        let nodes = generateGraph(parseCodeWithRange(code));
        assert.equal(
            dot(nodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x + 1; \n let b = a + y;\"  shape=\"box\"]\nn1 [label=\"(2)\nb < z\"  shape=\"diamond\"]\nn2 [label=\"(3)\nb++;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn c;\"  shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });


        it('is generating correct nodes', () => {
        let code = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    \n' +
            '    if(b < z) {\n' +
            '        b++;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}\n';
        let nodes = generateGraph(parseCodeWithRange(code));
        assert.equal(
            dot(nodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x + 1; \n let b = a + y;\"  shape=\"box\"]\nn1 [label=\"(2)\nb < z\"  shape=\"diamond\"]\nn2 [label=\"(3)\nb++;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn c;\"  shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n3 []\n }'
        );
    });

    it('is generating correct nodes', () => {
        let code = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    \n' +
            '    if(b < z) {\n' +
            '        b++;\n' +
            '    }\n' +
            '    else{\n' +
            '        c--;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}\n';
        let nodes = generateGraph(parseCodeWithRange(code));
        assert.equal(
            dot(nodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x + 1; \n let b = a + y;\"  shape=\"box\"]\nn1 [label=\"(2)\nb < z\"  shape=\"diamond\"]\nn2 [label=\"(3)\nb++;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn c;\"  shape=\"box\"]\nn4 [label=\"(5)\nc--;\"  shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n4 [label=\"F\"]\nn2 -> n3 []\nn4 -> n3 []\n }'        );
    });

    it('is generating correct nodes', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    if(a == 1){\n' +
            '       a++;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let nodes = generateGraph(parseCodeWithRange(code));
        assert.equal(
            dot(nodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0];\"  shape=\"box\"]\nn1 [label=\"(2)\na == 1\"  shape=\"diamond\"]\nn2 [label=\"(3)\na++;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n3 []\n }'
        );

    });


});





describe('The paintPath function', () => {
    it('is parsing an empty function correctly', () => {
        let code = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    return c;\n' +
            '}';
        let env = {'x':'1','y':'2','z':'3'};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x + 1; \n let b = a + y; \n let c = 0;\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nreturn c;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\n }'
        );
    });


    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    let b = a + 1;\n' +
            '    while(b < x[1]){\n' +
            '       b++;\n' +
            '    }\n' +
            '    return a;\n' +
            '}\n';
        let env = {'x':[1,3]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0]; \n let b = a + 1;\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nb < x[1]\"  style = filled fillcolor = green shape=\"diamond\"]\nn2 [label=\"(3)\nb++;\"  style = filled fillcolor = green shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });

    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    let b = a + 1;\n' +
            '    while(b < x[1]){\n' +
            '       b++;\n' +
            '    }\n' +
            '    return a;\n' +
            '}\n';
        let env = {'x':[2,3]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0]; \n let b = a + 1;\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nb < x[1]\"  style = filled fillcolor = green shape=\"diamond\"]\nn2 [label=\"(3)\nb++;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });

    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    if(a == 1){\n' +
            '       a++;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let env = {'x':[1,2]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0];\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\na == 1\"  style = filled fillcolor = green shape=\"diamond\"]\nn2 [label=\"(3)\na++;\"  style = filled fillcolor = green shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n3 []\n }'
        );
    });

    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0] + 1;\n' +
            '    let b = a + x[1];\n' +
            '    let c = [1,2];\n' +
            '    while(b < x[1]){\n' +
            '       c[0] = b + 1;\n' +
            '    }\n' +
            '    return a;\n' +
            '}\n';
        let env = {'x':[1,2]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0] + 1; \n let b = a + x[1]; \n let c = [\n    1,\n    2\n];\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nb < x[1]\"  style = filled fillcolor = green shape=\"diamond\"]\nn2 [label=\"(3)\nc[0] = b + 1;\"  shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });


    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    let b = a + 1;\n' +
            '    let c = [1,2];\n' +
            '    while(b < 10){\n' +
            '       b++;\n' +
            '       c[0] = b + 1;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let env = {'x':[1,2]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0]; \n let b = a + 1; \n let c = [\n    1,\n    2\n];\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nb < 10\"  style = filled fillcolor = green shape=\"diamond\"]\nn2 [label=\"(3)\nb++; \n c[0] = b + 1;\"  style = filled fillcolor = green shape=\"box\"]\nn3 [label=\"(4)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\nn1 -> n2 [label=\"T\"]\nn1 -> n3 [label=\"F\"]\nn2 -> n1 []\n }'
        );
    });


    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    a=1;\n' +
            '    return a;\n' +
            '}\n';
        let env = {'x':[1,2]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0]; \n a = 1;\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\n }'
        );
    });


    it('is painting function correctly', () => {
        let code = 'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    a--;\n' +
            '    return a;\n' +
            '}\n';
        let env = {'x':[1,2]};
        let cfgNodes = generateGraph(parseCodeWithRange(code));
        paintPath(cfgNodes[0],env);
        assert.equal(
            dot(cfgNodes),
            'digraph cfg { n0 [label=\"(1)\nlet a = x[0]; \n a--;\"  style = filled fillcolor = green shape=\"box\"]\nn1 [label=\"(2)\nreturn a;\"  style = filled fillcolor = green shape=\"box\"]\nn0 -> n1 []\n }'
            );
    });

});
