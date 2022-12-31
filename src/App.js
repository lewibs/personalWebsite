import { useRef } from "react";
import { Header } from "./content/Header";
import { Home } from "./content/Home";

function App() {
    const home = useRef();
    const about = useRef();
    const skills = useRef();
    const projects = useRef();
    const contact = useRef();

    return (
        <>
            <Home/>
            <Header refs={{
                "Lewibs": home,
                "About Me": about,
                "Skills": skills,
                "Projects": projects,
                "Contacts": contact,
            }}/>
        </>
    );
}

export default App;