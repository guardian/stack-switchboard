import React from "react";

const Table = () => {
  return (
    <div>
      <table className="table table-responsive-lg table-dark table-striped table-hover">
        <thead>
          <tr>
            <th scope="col">CloudFormation Stack</th>
            <th scope="col">Stage</th>
            <th scope="col">ASG Name</th>
            <th scope="col" className="th-md">
              Minimum Size
            </th>
            <th scope="col" className="th-md">
              Desired Size
            </th>
            <th scope="col" className="th-md">
              Maximum Size
            </th>
            <th scope="col" className="th-md">
              Alive
            </th>
            <th scope="col">Switch</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default Table;
