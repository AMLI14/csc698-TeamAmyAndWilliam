import React, {useState} from "react";
import '../stylesheets/Modal.css';

export default function Modal() {

    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal);
    }

    return (
        <>
            <button 
            className="btn-modal" 
            onClick={toggleModal}>
                Open Modal
             </button>

            <div className="modal">
                <div className="overlay">
                    <div className="modal-content">
                        <h2>Modal Title</h2>
                        <p>This is the content of the modal.</p>
                        <button onClick={toggleModal}>Close Modal</button>
                        <button onClick={() => alert('Action performed!')}>Perform Action</button>
                    </div>
                </div>
            </div>


        </>
    );
}