import React, { useState } from "react";
import Form from "react-bootstrap/Form";

export const SearchBar = ({ updateFilter }: { updateFilter: Function }) => {
  const [contents, setContents] = useState("");
  const updateContents = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContents(event.target.value);
    updateFilter(event.target.value);
  };

  return (
    <div
      style={{
        textAlign: "center",
        margin: "auto",
        width: "50%",
        padding: "10px"
      }}
    >
      <Form>
        <Form.Control
          type="text"
          onChange={updateContents}
          placeholder="Search ASGs"
          value={contents}
        />
        <Form.Text className="text-muted">You can filter by ASG name</Form.Text>
      </Form>
    </div>
  );
};
