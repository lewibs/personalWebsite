import React, { useState } from "react"
import {Canvas} from "react-three-fiber";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { useLoader } from '@react-three/fiber'
import { Stars, useProgress } from "@react-three/drei";
import { Suspense } from "react";
import Text from "./Text";
import Loading from "./Loading";
import styled from "styled-components";
import { meta } from "../meta";

//these could probably be split up and made cleaner but whats the point. None of it is going to be used elsewhere at this time.

//STYLES

const Background = styled.div`
    background: black;
    height: 100%;
    width:100%;
`;

//FUNCTIONS

//normalixe x to be between 0 and 1 
function squish(x, min, max) {
    x = (x - 200) / (1800 - 200);

    //if x is less then min return min
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    }

    return x;
}

//3D STUFF
function Laser({position}) {
    let multiplier = 1;

    if (position[0] < 0) {
        multiplier = -1;
    }

    return (
        <>
            <mesh position={position} scale={0.2}>
                <sphereBufferGeometry attach="geometry" />
                <meshBasicMaterial attach="material" color="red" />
            </mesh>
            <mesh position={[position[0] + (-0.2 * multiplier), position[1] - 0.1, position[2] + 4]} rotation={[1.6, 0, 0.05 * multiplier]}>
                <coneBufferGeometry args={[0.05, 10, 100]} />
                <meshBasicMaterial attach="material" color="red" />
            </mesh>
        </>
    )
}

function LaserEyes({position}) {
    return (
        <>
            <Laser position={position}/>
            <Laser position={[position[0] * -1, position[1], position[2]]}/>
        </>
    )
}

function Suit({position, scale, callBack}) {
    const fbx = useLoader(FBXLoader, meta.three.suit.geometry, callBack);
    return <primitive object={fbx} position={position} scale={scale} />
}

function Body({position, scale, rotation}) {
    //make a cilinder
    return(
        <mesh position={position} scale={scale} rotation={rotation}>
            <cylinderBufferGeometry attach="geometry" args={[0.5, 0.5, 1, 32]} />
            <meshLambertMaterial attach="material" color={0x0b1d71} />
        </mesh>
    )
}

function Head( {callBack} ) {
    const [x, setX] = React.useState(-0.1);
    const [y, setY] = React.useState(0);
    const [eyes, setEyes] = React.useState();

    React.useEffect(()=>{
        let headPos = (e) => {
            let xPos;
            let yPos;

            if (e.touches) {
                //fliped cause idk
                yPos = e.touches[0].pageX;
                xPos = e.touches[0].pageY;
            } else {
                xPos = e.clientY;
                yPos = e.clientX;
            }

            xPos = xPos - (window.innerHeight / 2);
            yPos = yPos - (window.innerWidth / 2);
            setX(xPos / window.innerWidth);
            setY(yPos / window.innerHeight);
        }

        let lazersOn = () => {
            setEyes(<LaserEyes position={[0.5,-0.2,1]} />);
            //wait for a second and then remove the eyes
            setTimeout(() => {
                setEyes();
            }, 100);
        }

        let lazersOff = () => {
            setEyes();
        }

        var is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;


        if (!is_mobile) {
            window.addEventListener('mousemove', headPos);
            window.addEventListener("mousedown", lazersOn);
            window.addEventListener("mouseup", lazersOff);
        } else {
            window.addEventListener('touchstart', headPos);
            window.addEventListener("touchstart", lazersOn);
            window.addEventListener("touchend", lazersOff);
        }
    });

    //THREE.DefaultLoadingManager.addHandler(/\.dds$/i, new DDSLoader());
    const materials = useLoader(MTLLoader, meta.three.head.texture, callBack);
    
    const obj = useLoader(OBJLoader, meta.three.head.geometry, (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });
    
    return (
        <mesh position={[0,0,-3]} rotation={[x, y, 0]}>
            {eyes}
            <primitive object={obj} position={[0,-2,-1.5]} scale={1.7} />
        </mesh>
    );
}

function Me() {
    const [loading, setLoading] = useState(<Loading />);
    const progress = useProgress();

    window.addEventListener("mousedown", (e)=>{})

    React.useEffect(()=>{
        if (progress.progress === 100) {
            setLoading(undefined)
        }
    }, [progress]);

    return (
        <Background>
            {loading}
            <Canvas>
                <Suspense fallback={null}>
                    <Head />
                    <Suit position={[0,-7,-3.5]} scale={0.15} />
                    <Body position={[0,-3.4,-4]} scale={3.5} rotation={[0.3,0,0]} />
                    <Text hAlign="center" position={[0, 2.5, -5.5]} children="LEWIBS" size={squish(window.innerWidth, 0.24, 0.6)} rotation={[-0.4,0,0]}/>
                    <Stars />
                    <ambientLight intensity={0.7} color={0xdcdcdc} />
                    <directionalLight position={[10,-50,50]} color={0xdcdcdc} intensity={1} />
                </Suspense>
            </Canvas>
        </Background>
    );
}

export default Me;