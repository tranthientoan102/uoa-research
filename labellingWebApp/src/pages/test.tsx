import React, { useRef, useState } from "react";





const Test = () => {

  const handleChange = (e) => {
    const files = e.target.files;

    for (const f of files) {
      let fileReader = new FileReader();
      fileReader.readAsText(f, "UTF-8");
      fileReader.onload = e => {

      };

    }
  };


  return (
    <div>

      <input type="file" onChange={handleChange} multiple={true} />
    </div>
  )

}

export default Test