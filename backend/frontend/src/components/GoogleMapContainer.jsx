import '../styles/Form.css';
import React, { useState } from 'react'
import {
    GoogleMap, useJsApiLoader,
    Marker,
    DirectionsRenderer,
    Circle,
    Autocomplete,
    MarkerClusterer
} from '@react-google-maps/api';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { ApiService } from '../api-service';
import parse from 'html-react-parser';


const containerStyle = {
    width: '100vw',
    height: '82vh'
};

var offcanvastitle = 'Im a title!';
var offcanvasbody = 'Im a body!';
var reviewlist = '';
var rating_average = '';


export const GoogleMapContainer = (props) => {

    const { waterAmenities, toiletAmenities, wifiAmenities, benchAmenities, parkingAmenities, mapCenter,
        setMapCenter, waterOn, wifiOn, benchOn, parkingOn, toiletOn } = props;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    })

    const [isReallyLoaded, setIsReallyLoaded] = React.useState(false);

    setTimeout(() => {
        setIsReallyLoaded(true);
    }, 200);

    const [show, setShow] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const codepoints = {
        water: "\ue798",
        wifi: "\ue63e",
        bench: "\uefee",
        toilet: "\ue63d",
        parking: "\ue54f"
    }

    const onLoad = (autocomplete) => {
        console.log('autocomplete: ', autocomplete)
        setAutocomplete(autocomplete)
    }

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace()
            console.log(place.geometry.location.lat(), place.geometry.location.lng())
            const searchLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              };
            setMapCenter(searchLocation)
        } else {
            console.log('Autocomplete is not loaded yet!')
        }
    }

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={17}
        >

            <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
            >
                <input
                    type="text"
                    placeholder="Search..."
                    style={{
                        boxSizing: `border-box`,
                        border: `1px solid transparent`,
                        width: `300px`,
                        height: `40px`,
                        padding: `0 12px`,
                        borderRadius: `3px`,
                        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                        fontSize: `16px`,
                        outline: `none`,
                        textOverflow: `ellipses`,
                        position: "absolute",
                        left: "48%",
                        top: "10px",
                        marginLeft: "-120px",
                        backgroundColor: "white"

                    }}
                />
            </Autocomplete>

            <Offcanvas show={show} onHide={handleClose} scroll={false} backdrop={false} placement={'start'}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{offcanvastitle}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>  
                    <Button variant="primary">Google Maps</Button>{' '} 
                    <br></br> 
                    <br></br> 
                    <div className='AverageRating'> {rating_average} </div>
                    <br></br> 
                    <br></br>
                    <div className='Review'> {parse(reviewlist)} </div>

                    <br></br> 
                    <br></br>

                    <button className="buttonaddreview">Add Review</button>
                </Offcanvas.Body>
            </Offcanvas>

            { /* Child components, such as markers, info windows, etc. */}
            {isReallyLoaded ?
                <>
                    {/* User location */}
                    <Marker
                        position={mapCenter} />

                    {/* Amenities */}
                    {/* codepoints from https://fonts.google.com/icons */}

                    {waterOn ?
                        waterAmenities.map((waterAmenity) => (
                            <Marker
                                key={waterAmenity.id}
                                label={{
                                    text: codepoints.water,
                                    fontFamily: "Material Icons",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                                position={{ lat: waterAmenity.water_latitude, lng: waterAmenity.water_longitude }}
                                onClick={() => {
                                    
                                    const apiService = new ApiService();
                                    const reviewDataPromise = apiService.getReview('water', waterAmenity.id);                                      

                                    reviewDataPromise.then((reviewData) => {

                                        var average_rating = 0;
                                        var undeleted_reviews = 0;
                                    
                                        reviewlist = '<ListGroup>';
                                        for (let i=0; i < reviewData.length; i++){
                                            if (reviewData[i].is_deleted === false) {
                                                reviewlist  = reviewlist.concat(`<ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                                
                                                <div className="ms-2 me-auto">
                                                 
                                                    <div className="fw-bold">User ID: ${reviewData[i].user}  |  Rating: ${reviewData[i].rating} </div>
                                                        ${reviewData[i].review}
                                                        <br></br>
                                                        Likes: ${reviewData[i].upvotes} Dislikes: ${reviewData[i].downvotes} 
                                                        <br></br>
                                                        <button className="buttonlike">Like</button> <button className="buttonflag">Flag</button> <button className="buttondislike">Dislike</button>
                                                    </div>
                                                    
                                                </ListGroup.Item>
                                                `);
                                                average_rating = average_rating + reviewData[i].rating;
                                                undeleted_reviews++;
                                                
                                            }
                                        }
                                        average_rating = average_rating / undeleted_reviews;
                                        reviewlist  = reviewlist.concat('</ListGroup>');

                                        offcanvastitle = 'Water Amenity, ID:' + waterAmenity.id + ' ';
                                        if (undeleted_reviews > 0) {
                                            rating_average = "Average Rating: " + average_rating;
                                        } else {
                                            rating_average = 'No Reviews Yet';
                                        }
                                        handleShow();
                                });
                            }} />
                        ))
                        : null}

                    {toiletOn ?
                        toiletAmenities.map((toiletAmenity) => (
                            <Marker
                                key={toiletAmenity.id}
                                label={{
                                    text: codepoints.toilet,
                                    fontFamily: "Material Icons",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                                position={{ lat: toiletAmenity.toilet_latitude, lng: toiletAmenity.toilet_longitude }}
                                onClick={() => {
                                    const apiService = new ApiService();
                                    const reviewDataPromise = apiService.getReview('toilet', toiletAmenity.id);                                      

                                    reviewDataPromise.then((reviewData) => {

                                        var average_rating = 0;
                                        var undeleted_reviews = 0;
                                    
                                        reviewlist = '<ListGroup>';
                                        for (let i=0; i < reviewData.length; i++){
                                            if (reviewData[i].is_deleted === false) {
                                                reviewlist  = reviewlist.concat(`<ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                                
                                                <div className="ms-2 me-auto">
                                                 
                                                    <div className="fw-bold">User ID: ${reviewData[i].user}  |  Rating: ${reviewData[i].rating} </div>
                                                        ${reviewData[i].review}
                                                        <br></br>
                                                        Likes: ${reviewData[i].upvotes} Dislikes: ${reviewData[i].downvotes} 
                                                        <br></br>
                                                        <button className="buttonlike">Like</button> <button className="buttonflag">Flag</button> <button className="buttondislike">Dislike</button>
                                                    </div>
                                                    
                                                </ListGroup.Item>
                                                `);
                                                average_rating = average_rating + reviewData[i].rating;
                                                undeleted_reviews++;
                                                
                                            }
                                        }
                                        average_rating = average_rating / undeleted_reviews;
                                        reviewlist  = reviewlist.concat('</ListGroup>');

                                        offcanvastitle = 'Toilet Amenity, ID:' + toiletAmenity.id + ' ';
                                        if (undeleted_reviews > 0) {
                                            rating_average = "Average Rating: " + average_rating;
                                        } else {
                                            rating_average = 'No Reviews Yet';
                                        }
                                        handleShow();
                                });
                            }} />
                        ))
                        : null}

                    {wifiOn ?
                        wifiAmenities.map((wifiAmenity) => (
                            <Marker
                                key={wifiAmenity.id}
                                label={{
                                    text: codepoints.wifi,
                                    fontFamily: "Material Icons",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                                position={{ lat: wifiAmenity.wifi_latitude, lng: wifiAmenity.wifi_longitude }}
                                onClick={() => {
                                    const apiService = new ApiService();
                                    const reviewDataPromise = apiService.getReview('wifi', wifiAmenity.id);                                      

                                    reviewDataPromise.then((reviewData) => {

                                        var average_rating = 0;
                                        var undeleted_reviews = 0;
                                    
                                        reviewlist = '<ListGroup>';
                                        for (let i=0; i < reviewData.length; i++){
                                            if (reviewData[i].is_deleted === false) {
                                                reviewlist  = reviewlist.concat(`<ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                                
                                                <div className="ms-2 me-auto">
                                                 
                                                    <div className="fw-bold">User ID: ${reviewData[i].user}  |  Rating: ${reviewData[i].rating} </div>
                                                        ${reviewData[i].review}
                                                        <br></br>
                                                        Likes: ${reviewData[i].upvotes} Dislikes: ${reviewData[i].downvotes} 
                                                        <br></br>
                                                        <button className="buttonlike">Like</button> <button className="buttonflag">Flag</button> <button className="buttondislike">Dislike</button>
                                                    </div>
                                                    
                                                </ListGroup.Item>
                                                `);
                                                average_rating = average_rating + reviewData[i].rating;
                                                undeleted_reviews++;
                                                
                                            }
                                        }
                                        average_rating = average_rating / undeleted_reviews;
                                        reviewlist  = reviewlist.concat('</ListGroup>');

                                        offcanvastitle = 'Wifi Amenity, ID:' + wifiAmenity.id + ' ';
                                        if (undeleted_reviews > 0) {
                                            rating_average = "Average Rating: " + average_rating;
                                        } else {
                                            rating_average = 'No Reviews Yet';
                                        }
                                        handleShow();
                                });
                            }} />
                        ))
                        : null}

                    {parkingOn ?
                        parkingAmenities.map((parkingAmenity) => (
                            <Marker
                                key={parkingAmenity.id}
                                label={{
                                    text: codepoints.parking,
                                    fontFamily: "Material Icons",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                                position={{ lat: parkingAmenity.parking_latitude, lng: parkingAmenity.parking_longitude }}
                                onClick={() => {
                                    const apiService = new ApiService();
                                    const reviewDataPromise = apiService.getReview('parking', parkingAmenity.id);                                      

                                    reviewDataPromise.then((reviewData) => {

                                        var average_rating = 0;
                                        var undeleted_reviews = 0;
                                    
                                        reviewlist = '<ListGroup>';
                                        for (let i=0; i < reviewData.length; i++){
                                            if (reviewData[i].is_deleted === false) {
                                                reviewlist  = reviewlist.concat(`<ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                                
                                                <div className="ms-2 me-auto">
                                                 
                                                    <div className="fw-bold">User ID: ${reviewData[i].user}  |  Rating: ${reviewData[i].rating} </div>
                                                        ${reviewData[i].review}
                                                        <br></br>
                                                        Likes: ${reviewData[i].upvotes} Dislikes: ${reviewData[i].downvotes} 
                                                        <br></br>
                                                        <button className="buttonlike">Like</button> <button className="buttonflag">Flag</button> <button className="buttondislike">Dislike</button>
                                                    </div>
                                                    
                                                </ListGroup.Item>
                                                `);
                                                average_rating = average_rating + reviewData[i].rating;
                                                undeleted_reviews++;
                                                
                                            }
                                        }
                                        average_rating = average_rating / undeleted_reviews;
                                        reviewlist  = reviewlist.concat('</ListGroup>');

                                        offcanvastitle = 'Parking Amenity, ID:' + parkingAmenity.id + ' ';
                                        if (undeleted_reviews > 0) {
                                            rating_average = "Average Rating: " + average_rating;
                                        } else {
                                            rating_average = 'No Reviews Yet';
                                        }
                                        handleShow();
                                });
                            }} />
                        ))
                        : null}

                    {benchOn ?
                        benchAmenities.map((benchAmenity) => (
                            <Marker
                                key={benchAmenity.id}
                                label={{
                                    text: codepoints.bench,
                                    fontFamily: "Material Icons",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                                position={{ lat: benchAmenity.bench_latitude, lng: benchAmenity.bench_longitude }}
                                onClick={() => {
                                    const apiService = new ApiService();
                                    const reviewDataPromise = apiService.getReview('bench', benchAmenity.id);                                      

                                    reviewDataPromise.then((reviewData) => {

                                        var average_rating = 0;
                                        var undeleted_reviews = 0;
                                    
                                        reviewlist = '<ListGroup>';
                                        for (let i=0; i < reviewData.length; i++){
                                            if (reviewData[i].is_deleted === false) {
                                                reviewlist  = reviewlist.concat(`<ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                                                
                                                <div className="ms-2 me-auto">
                                                 
                                                    <div className="fw-bold">User ID: ${reviewData[i].user}  |  Rating: ${reviewData[i].rating} </div>
                                                        ${reviewData[i].review}
                                                        <br></br>
                                                        Likes: ${reviewData[i].upvotes} Dislikes: ${reviewData[i].downvotes} 
                                                        <br></br>
                                                        <button className="buttonlike">Like</button> <button className="buttonflag">Flag</button> <button className="buttondislike">Dislike</button>
                                                    </div>
                                                    
                                                </ListGroup.Item>
                                                `);
                                                average_rating = average_rating + reviewData[i].rating;
                                                undeleted_reviews++;
                                                
                                            }
                                        }
                                        average_rating = average_rating / undeleted_reviews;
                                        reviewlist  = reviewlist.concat('</ListGroup>');

                                        offcanvastitle = 'Bench Amenity, ID:' + benchAmenity.id + ' ';
                                        if (undeleted_reviews > 0) {
                                            rating_average = "Average Rating: " + average_rating;
                                        } else {
                                            rating_average = 'No Reviews Yet';
                                        }
                                        handleShow();
                                });
                            }} />
                        ))
                        : null}

                </>
                : null}
        </GoogleMap>
    ) : <>Loading</>
}

