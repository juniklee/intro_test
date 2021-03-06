import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import expo from './img/expo.jpg'
import back from './img/back.png'
import logo from './fbx/test.fbx'



	// 3차원 세계
			var scene = new THREE.Scene();
			// 카메라 ( 카메라 수직 시야 각도, 가로세로 종횡비율, 시야거리 시작지점, 시야거리 끝지점
			var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000 );
			// 렌더러 정의 및 크기 지정, 문서에 추가하기
			var renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.querySelector("#canvasWrap").appendChild(renderer.domElement); // html의 canvas태그로 연결
			document.body.appendChild(renderer.domElement); 
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFShadowMap;		// <-- 속도가 빠르다

			var model;

			var loader = new THREE.TextureLoader();
			var loaderMesh = new THREE.ColladaLoader();
			loaderMesh.load(
				'http://dreamplan7.cafe24.com/canvas/img/home.dae',
				function ( collada ){						
					model = collada.scene;
					model.children[0].castShadow=true;
					model.children[1].castShadow=true;
					model.children[2].castShadow=true;
					model.children[3].castShadow=true;
					model.children[4].castShadow=true;
					model.children[5].castShadow=true;
					model.rotation.x= -90 * ( Math.PI / 180 ); 
					model.rotation.z= -90 * ( Math.PI / 180 ); 
					model.position.set(0,10,-10);
					//scene.add( model );
      });
			// 바닥
			var floor;
			floor = new THREE.Mesh(
				new THREE.BoxGeometry(10, 10, 10)
			);
			loader.load(
					'http://dreamplan7.cafe24.com/canvas/img/floor1.jpg', 
					function ( texture ) {
						floor.material = new THREE.MeshStandardMaterial({map: texture});
						floor.material.map.repeat.x=3;
						floor.material.map.repeat.y=3;
						floor.material.map.wrapS=THREE.RepeatWrapping;
						floor.material.map.wrapT=THREE.RepeatWrapping;
					}
			);
			//scene.add(floor);


			//FBX파일 로드
			const fbxLoder = new FBXLoader();
			console.log(fbxLoder);
			var obj = null;
		

			fbxLoder.load(
				logo,
				(object) => {
					console.log(object);
					obj = object;
					
					object.position.x = -10.5
					object.position.y = 0	
					object.position.z = -10

					object.rotation.x =  0
					object.rotation.y = -11.5
					object.rotation.z = 0

					object.scale.set(0.1,0.1,0.1)
					scene.add(object)
				}
			)


		//지구 만들기
			const earthMap = new THREE.TextureLoader().load(expo);
			const material_earth = new THREE.MeshPhongMaterial({
				map: earthMap,
				shininess:120,

			});
			const geometry_earth = new THREE.SphereGeometry(15, 64, 64);
			//80 사이즈로 구를 만든다
			var earth = new THREE.Mesh(geometry_earth, material_earth);
			earth.rotation.y = 0.1;
			earth.autoRotate = true;
			earth.position.set(0,5,0); // 심볼위치 조정
			//scene.add(earth);


			floor.position.set(0, -100, 0);
			floor.receiveShadow=true;

			// 카메라의 위치 조정
			camera.position.set ( 105, 10, 60 );
	
			// 카메라가 회전하는
			var controls = new THREE.OrbitControls (camera, renderer.domElement);
			controls.enablePan = false;
			controls.minPolarAngle = Math.PI / -2;
			controls.maxPolarAngle = Math.PI / 2.1;
			controls.autoRotate = true; //자동 회전
   		    controls.autoRotateSpeed = 5.5; //회전 속도 (기본 : 2)



			// 전체 조명을 추가합니다.
			var light_base = new THREE.AmbientLight( 0xf0f0f0 ); // soft white light
			scene.add( light_base );

			var light_sun = new THREE.DirectionalLight ( 0x808080, 5.0 );
			//light_sun.position.set( 200, 200, 300 );
			scene.add( light_sun );
			var shadowBlur=10;
			light_sun.castShadow=true;
			light_sun.shadow.camera.left=-shadowBlur;
			light_sun.shadow.camera.right=shadowBlur;
			light_sun.shadow.camera.top=shadowBlur;
			light_sun.shadow.camera.bottom=-shadowBlur;

			// Water
			var waterGeometry = new THREE.PlaneBufferGeometry( 100000, 100000 );

			var water = new THREE.Water(
				waterGeometry,
				{
					textureWidth: 12,
					textureHeight: 12,
					waterNormals: new THREE.TextureLoader().load( 'http://dreamplan7.cafe24.com/canvas/img/waternormals.jpg', function ( texture ) {
						texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					} ),
					alpha: 0.1,
					sunDirection: light_sun.position.clone().normalize(),
					sunColor: 0xffffff,
					waterColor: 0x001e0f,
					distortionScale:1.7,
					fog: scene.fog !== undefined
				}
			);

			water.position.set(0,-300,0); // 바다 위치 조정
			water.rotation.x = - Math.PI / 2;
			scene.add( water );

			var sky = new THREE.Sky();

			sky.material.uniforms['turbidity'].value=0.3;
			sky.material.uniforms['rayleigh'].value=0.09;
			sky.material.uniforms['luminance'].value=0.1; // 아침은 0.1 
			sky.material.uniforms['mieCoefficient'].value=0.005;
			sky.material.uniforms['mieDirectionalG'].value=0.1; //

			var parameters = {
				distance: 900,
				inclination: 0.1,
				azimuth: 0.05
			};

			var cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
			scene.background = cubeCamera.renderTarget;

			var theta = Math.PI * ( parameters.inclination - 0.5 );
			var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

			light_sun.position.x = parameters.distance * Math.cos( phi );
			light_sun.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
			light_sun.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );

			sky.material.uniforms['sunPosition'].value = light_sun.position.copy( light_sun.position );
			water.material.uniforms['sunDirection'].value.copy( light_sun.position ).normalize();

			cubeCamera.update( renderer, sky );

			// ==========================
			// 초기화 부분 끝
			// ========================== 

			var framesPerSecond=40;

			// 에니메이션 효과를 자동으로 주기 위한 보조 기능입니다.
			var animate = function () {
				// 프레임 처리
				setTimeout(function() {
					 requestAnimationFrame(animate); 
				}, 200 / framesPerSecond);

				water.material.uniforms[ 'time' ].value += 0.7 / 60.0;
				earth.rotation.y += 0.005; // 심볼회전
				obj.rotation.z +=0.005;
				// 랜더링을 수행합니다.
				renderer.render( scene, camera );

		
				//  requestAnimationFrame(animate);
			};


	

			// animate()함수를 최초에 한번은 수행해주어야 합니다.
			animate();		

