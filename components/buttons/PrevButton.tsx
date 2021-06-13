import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';

const PrevButton = (props) => {
    const { handleClick } = props;

    return (
        
            <button className="prev-button" onClick={() => handleClick()}>
                
                <div className="nav-icon">

                    <NavigateBeforeIcon style={{color: "white", width: "18px", height: "18px"}} />
                </div>
                <style>{`
                    .prev-button {
                        width: fit-content;
                        background-color: transparent;
                        border: none;
                    }
                    .nav-icon{
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        background-image: #13163a;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      
                    }

                `}</style>
            </button>
            
        
    );

}

export default PrevButton