import React from 'react';
import '../../assets/record.scss';


const Record = ({record, detailsValue, handleDetails, teraphyValue, handleTerpahy, conditionValue, handleCondition, submitValue, handleSubmit}) => (
    <div className="row">
        <ul className="nav nav-pills">
            <li className="disabled"><a href="#list">Record</a></li>
        </ul>
        <div className="box">
            {record.map(data => {
                return (     
                    <div key={data.id} className="record-box">
                        <p>Client: {data.client}</p>
                        <p>Speciality: {data.speciality}</p>
                        <p>Details: {data.details}</p>
                        <p>Teraphy history: {data.teraphy_history}</p>
                        <p>Medical conditions: {data.medical_conditions}</p>
                    </div>
                )
            })}
        </div>
        <div className="r-form">
            <div className="details"> 
                <input type="text" className="d-details" placeholder="Enter details" value={detailsValue} onChange={handleDetails}/>
            </div>     
            <div className="teraphy-history"> 
                <input type="text" className="d-teraphy" placeholder="Enter teraphy" value={teraphyValue} onChange={handleTerpahy}/>
            </div>
            <div className="medical-con"> 
                <input type="text" className="d-medical" placeholder="Enter condition" value={conditionValue} onChange={handleCondition}/>
            </div>
            <div className="submit">
                <button type="submit" className="btn btn-primary" value={submitValue} onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    </div>
);

export default Record;