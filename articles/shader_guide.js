import * as THREE from "https://cdn.skypack.dev/three@0.129.0";

function setupDemo1() {
    const demo = document.getElementById("demo1");
    const overlay = demo.children[0];
    const canvas = demo.children[1];
    const renderer = new THREE.WebGLRenderer({ canvas });

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.01, 2000);
    camera.position.set(0, 0, 2);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D1116);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 3, 2);
    scene.add(light);

    var ambi = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambi);

    var cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1, 1, 30, 1), new THREE.MeshPhongMaterial({ color: 0x841A00 }));
    scene.add(cube);

    // Similar to the example for modified materials on the Three.js website: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_modified.html

    cube.material.onBeforeCompile = function(shader) {
        shader.uniforms.time = { value: 0.0 };
        // Flat shading makes it so that normals are calculated per fragment rather than using the normal attribute
        // This does not work for lambert materials since there lighting is calculated in the vertex shader
        // Technically, you could manually recalculate normals if you had tangents and bitangents
        // -- see this for how to: https://www.ronja-tutorials.com/post/015-wobble-displacement/
        shader.flatShading = true;
        shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `vec3 transformed = vec3(position);
            transformed.xz *= sin(transformed.y * PI * 3.0 + time * 2.0) * 0.25 + 0.75;`
        );
        cube.material.userData.shader = shader;
    };

    function resize() {
        renderer.setSize(canvas.clientWidth, canvas.clientWidth / (16 / 9), false);
        camera.aspect = 16 / 9;
        camera.updateProjectionMatrix();
    }
    resize();
    var debounceResize;
    window.addEventListener("resize", e => {
        clearTimeout(debounceResize);
        debounceResize = setTimeout(resize, 250);
    });

    var playState = 0;
    var prevFrameTime = 0;
    var time = 0;
    overlay.addEventListener("click", e => {
        playState = playState ? 0 : 1;
        overlay.style.opacity = playState ? 0 : 1;
    });

    renderer.render(scene, camera);

    return function() {
        if (playState) {
            var delta = (Date.now() - prevFrameTime) / 1000;
            prevFrameTime = Date.now();
            if (playState == 1) {
                playState = 2;
                delta = 0;
                return;
            }
            time += delta;
            if (cube.material.userData.shader) cube.material.userData.shader.uniforms.time.value = time;

            cube.rotation.y += 0.5 * delta;
            camera.position.y = Math.sin(time) * 0.1;
            renderer.render(scene, camera);
        }
    }
}
// function setupDemo2() {
//     const demo = document.getElementById("demo2");
//     const overlay = demo.children[0];
//     const canvas = demo.children[1];
//     const renderer = new THREE.WebGLRenderer({ canvas });

//     const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.01, 2000);
//     camera.position.set(0, 0, 2);

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x0D1116);

//     var light = new THREE.DirectionalLight(0xffffff, 1);
//     light.position.set(1, 3, 2);
//     scene.add(light);

//     var cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({ color: 0x008800 }));
//     scene.add(cube);

//     function resize() {
//         renderer.setSize(canvas.clientWidth, canvas.clientWidth / (16 / 9), false);
//         camera.aspect = 16 / 9;
//         camera.updateProjectionMatrix();
//     }
//     resize();
//     var debounceResize;
//     window.addEventListener("resize", e => {
//         clearTimeout(debounceResize);
//         debounceResize = setTimeout(resize, 250);
//     });

//     var playState = 0;
//     var prevFrameTime = 0;
//     var time = 0;
//     overlay.addEventListener("click", e => {
//         playState = playState ? 0 : 1;
//         overlay.style.opacity = playState ? 0 : 1;
//     });

//     renderer.render(scene, camera);

//     return function() {
//         if (playState) {
//             var delta = (Date.now() - prevFrameTime) / 1000;
//             prevFrameTime = Date.now();
//             if (playState == 1) {
//                 playState = 2;
//                 delta = 0;
//                 return;
//             }
//             time += delta;
//             cube.rotation.y += 0.5 * delta;
//             camera.position.y = Math.sin(time) * 0.1;
//             renderer.render(scene, camera);
//         }
//     }
// }
function setupDemo3() {
    const demo = document.getElementById("demo3");
    const overlay = demo.children[0];
    const canvas = demo.children[1];
    const renderer = new THREE.WebGLRenderer({ canvas });

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.01, 2000);
    camera.position.set(0, 0, 2);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D1116);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 0, 2);
    scene.add(light);

    var cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    new THREE.TextureLoader().load("../imgs/articles/testtex_512.png", tex => { cube.material.map = tex; cube.material.needsUpdate = true; });
    scene.add(cube);

    cube.material.onBeforeCompile = function(shader) {
        // shader.uniforms.time = time;
        // shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <tonemapping_fragment>",
            `gl_FragColor.rgb = gl_FragColor.brg;
            gl_FragColor.rgb = 4.0 * gl_FragColor.rgb - 1.5;
            #include <tonemapping_fragment>`
        );
        cube.material.userData.shader = shader;
    };

    function resize() {
        renderer.setSize(canvas.clientWidth, canvas.clientWidth / (16 / 9), false);
        camera.aspect = 16 / 9;
        camera.updateProjectionMatrix();
    }
    resize();
    var debounceResize;
    window.addEventListener("resize", e => {
        clearTimeout(debounceResize);
        debounceResize = setTimeout(resize, 250);
    });

    var playState = 0;
    var prevFrameTime = 0;
    var time = 0;
    overlay.addEventListener("click", e => {
        playState = playState ? 0 : 1;
        overlay.style.opacity = playState ? 0 : 1;
    });

    renderer.render(scene, camera);

    return function() {
        if (playState) {
            var delta = (Date.now() - prevFrameTime) / 1000;
            prevFrameTime = Date.now();
            if (playState == 1) {
                playState = 2;
                delta = 0;
                return;
            }
            time += delta;
            cube.rotation.y += 0.5 * delta;
            camera.position.y = Math.sin(time) * 0.1;
            renderer.render(scene, camera);
        }
    }
}

var updateDemo1 = setupDemo1();
// var updateDemo2 = setupDemo2();
var updateDemo3 = setupDemo3();

function animate(now) {
    updateDemo1();
    // updateDemo2();
    updateDemo3();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);