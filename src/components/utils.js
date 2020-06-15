import React from 'react';
import { Spinner } from 'react-bootstrap';

function SpinnerFP(props) {
  return (
      <Spinner animation="border" role="status"  style={{position: "fixed",
                                                         zIndex: "999",
                                                         overflow: "show",
                                                         margin: "auto",
                                                         top: 0,
                                                         left: 0,
                                                         bottom: 0,
                                                         right: 0,
                                                         width: "100px",
                                                         height: "100px"}}>
        <span className="sr-only">Loading...</span>
    </Spinner>
  );
}

export {SpinnerFP};
