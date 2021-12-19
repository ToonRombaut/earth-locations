import * as THREE from "three";
import fragment from "@three/shaders/fragment.glsl?raw";
import vertex from "@three/shaders/vertex.glsl?raw";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from "dat.gui";
import gsap from "gsap";

import map from "@assets/img/earth.jpg";

export default class Sketch {

    constructor() {
        this.scene = new THREE.Scene();

        this.container = document.querySelector("#default-layout");
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0xeeeeee, 1);
        //this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        );

        // var frustumSize = 10;
        // var aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
        this.camera.position.set(0, 0, 2);
        //orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;

        this.clock = new THREE.Clock();

        this.settings();
        this.setupResize();

    }
    settings = () => {
        this.settings = {
            progress: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, "progress", 0, 1, 0.01);

    };

    setupResize = () => {
        window.addEventListener("resize", this.resize);
    };

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    addObjects = () => {
        this.tubeMaterial = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.earthMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(map)
        });

        this.geometry = new THREE.SphereBufferGeometry(1, 30, 30);

        this.planet = new THREE.Mesh(this.geometry, this.earthMaterial);
        this.scene.add(this.planet);

        function convertLatLngToCartesian(p) {
            const lat = (90 - p.lat) * Math.PI / 180;
            const lng = (180 + p.lng) * Math.PI / 180;

            let x = -Math.sin(lat) * Math.cos(lng);
            let y = Math.cos(lat);
            let z = Math.sin(lat) * Math.sin(lng);

            return {
                x,
                y,
                z
            };
        }

        let point1 = {
            lat: 50.4501,
            lng: 30.5234
        };

        let point2 = {
            lat: 25.3548,
            lng: 51.1839
        };

        let point3 = {
            lat: 41.8781,
            lng: -87.6298
        };

        let point4 = {
            lat: 32.7767,
            lng: -96.7970
        };

        let point5 = {
            lat: 21.1619,
            lng: -86.8515
        };

        let point6 = {
            lat: 15.8720,
            lng: -97.0767
        };

        let traject = [
            point1,
            point2,
            point3,
            point4,
            point5,
            point6,
        ];

        for (let i = 0; i < traject.length; i++) {
            const pos1 = convertLatLngToCartesian(traject[i]);

            const mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(0.015, 20, 20), new THREE.MeshBasicMaterial({ color: 0xff0000 }));

            mesh.position.set(pos1.x, pos1.y, pos1.z);

            this.scene.add(mesh);
            if (i < traject.length - 1) {
                const pos2 = convertLatLngToCartesian(traject[i + 1]);
                this.getCurve(pos1, pos2);
            }

        }

    };

    getCurve = (p1, p2) => {
        let v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
        let v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
        let points = [];
        for (let i = 0; i <= 20; i++) {
            let p = new THREE.Vector3().lerpVectors(v1, v2, i / 20);
            p.normalize();
            p.multiplyScalar(1 + 0.1 * Math.sin(Math.PI * i / 20));
            points.push(p);
        }

        let path = new THREE.CatmullRomCurve3(points);

        const geo = new THREE.TubeGeometry(path, 20, 0.005, 8, false);
        const mat = this.tubeMaterial;
        const mesh = new THREE.Mesh(geo, mat);
        this.scene.add(mesh);
    };

    render() {
        this.time = this.clock.getElapsedTime();
        this.tubeMaterial.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
    goTo = route => {
        switch (route) {
            case 'home':
                this.addObjects();
        }
        this.render();
    };

}