import styled, { keyframes } from 'styled-components'
import React, { useEffect, useState } from "react";
import { colors } from "../style/colors";
import { dim } from "../style/dim";
import Carousel from 'react-material-ui-carousel'
import axios from "axios";
import { meta } from "../meta";
import { BoundingBox } from "../components/BoundingBox";
import { useRef } from "react";
import {Title} from "../components/Title";

const PageHeight = 250;
const ButtonHeight = 25;
const animationDist = window.innerWidth;
const animation = "0.5s 1 ease-in forwards";

const Main = styled.div`
    background: ${colors.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${dim.padding};
`;

const Frame = styled.div`
    display: flex;
    justify-content: center;
    padding: 0 ${isPhone() ? 0 : "100px"};
    height: ${props=>props.height};

    ${({clickable})=>{
        if (clickable) {
            return `cursor: pointer;`
        }
    }}
`;

const About = styled.div`
    width: 100%;
    max-width: ${dim.maxWidth};
    text-align: left;
    display:flex;
    flex-direction: column;
    gap: 10px;
`;

const More = styled.div`
    cursor: pointer;
    color: ${colors.tertiaryDark};

`;

const ProjectTitle = styled.div`
    font-weight: bold;
    font-size: 1.3em;
    padding: 5px 0;
`;

const ImgC = styled.div`
    position: absolute;
`;

const Curtain = styled.div`
    width: 100vw;
    background: red;
`;

const Img = styled.img`
    position: relative;
`;

const CurtainR = styled(Curtain)`
    -webkit-animation: ${keyframe("right", 0, animationDist)} ${animation};
    -moz-animation: ${keyframe("right", 0, animationDist)} ${animation};
    -o-animation: ${keyframe("right", 0, animationDist)} ${animation};
`;

const CurtainL = styled(Curtain)`
    -webkit-animation: ${keyframe("left", 0, animationDist)} ${animation};
    -moz-animation: ${keyframe("left", 0, animationDist)} ${animation};
    -o-animation: ${keyframe("left", 0, animationDist)} ${animation};
`;

const ImgR = styled(Img)`
    clip-path: polygon(0% 100%, 100% 100%, 100% 0);
`;

const ImgL = styled(Img)`
    clip-path: polygon(0 0, 0 100%, 100% 0);
`

function isPhone() {
    return window.innerWidth <= +dim.phone.replace("px", "")
}

function keyframe(dir, from, to) {
    let trans = to;

    if (dir==="left") {
        trans = "-" + to + "px";
    } else if (dir==="right") {
        trans = to + "px";
    }

    return keyframes`
        from {
            transform: translate(${from}px);
        }

        to {
            transform: translate(${trans});
        }
    `;
}

function Project({title, image, info, link, last, id}) {
    const frameRef = useRef();
    const aboutRef = useRef();
    const imgRef = useRef();
    const [height, setHeight] = useState(PageHeight);
    const [imw, setImw] = useState(0);
    const [hover, setHover] = useState(false);

    useEffect(()=>{
        if (frameRef.current) {
            setHeight(frameRef.current.clientHeight - ButtonHeight);    
        }
    },[frameRef]);

    useEffect(()=>{
        if (!hover) {
            setImw(imgRef.current.clientWidth);
        }
    },[imgRef]);

    useEffect(()=>{
        if (id === last) {
            triggerClose();
        }
    }, [id, last])

    function triggerSlide() {
        setHover(true);
    }

    function triggerClose() {
        setHover(false);
    }

    function attachActions(hover) {
        if (hover) {
            return {
                onClick: triggerSlide,
                onMouseLeave: triggerClose
            }
        } else {
            return {
                onClick: triggerSlide,
                onMouseEnter: triggerSlide
            }
        }
    }

    return(
        <div>
            {(hover)
                ?<>
                    <Frame 
                        clickable={false}
                        ref={frameRef}
                        height={height + "px"}
                    >
                        <ImgC>
                            <CurtainL>
                                <ImgL
                                    height={height + "px"}
                                    src={image}
                                />
                            </CurtainL>
                        </ImgC>
                        <About
                            ref={aboutRef}
                        >
                            <ProjectTitle>{title}</ProjectTitle>
                            {info}
                            <More 
                                onClick={()=>window.location.href = link}
                            >
                                click for more &#xbb;
                            </More>
                        </About>
                        <ImgC>
                            <CurtainR>
                                <ImgR
                                    height={height + "px"}
                                    src={image}
                                />
                            </CurtainR>
                        </ImgC>
                    </Frame>
                </>
                :<>
                    <Frame 
                        clickable={true}
                        ref={frameRef}
                        height={height + "px"}
                    >
                        <Img 
                            ref={imgRef}
                            imw={imw}
                            height={height + "px"}
                            src={image}
                            {...attachActions(hover)}
                        />
                    </Frame>
                    <ProjectTitle>{title}</ProjectTitle>
                </>
            }
        </div>
    );
}

export const Projects = React.forwardRef(({}, ref) => {
    const [projects, setProjects] = useState([]);
    //const [current, setCurrent] = useState();
    const [last, setLast] = useState();

    useEffect(()=>{
        axios.get(meta.projects).then((res)=>{
            setProjects(res.data);
        })
    },[]);

    function handleChange(current, last) {
        //setCurrent(current);
        setLast(last);
    }

    return (
        <Main ref={ref}>
            <BoundingBox>
                <Title>Projects</Title>
                <Carousel
                    sx={{
                        width: "100%",
                        maxWidth: dim.maxWidth,
                    }}
                    cycleNavigation
                    stopAutoPlayOnHover
                    swipe
                    navButtonsAlwaysVisible={!isPhone()}
                    animation={"slide"}
                    interval={6000}
                    height={PageHeight}
                    onChange={handleChange}
                >
                    {projects.map((project,i)=><Project
                        id={i}
                        last={last}
                        key={i}
                        title={project.title}
                        image={project.image}
                        info={project.info}
                        link={project.link}
                    />)}
                </Carousel>
            </BoundingBox>
        </Main>
    );
});