import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

import { API_ENDPOINTS } from "../../utils/values";
import { TableRow } from "./tableRow";
import { SearchBar } from "./searchbar";
import { EnrichedAutoScalingGroup } from "../../utils/interfaces";

interface Data extends EnrichedAutoScalingGroup {
  hide: boolean;
}

export const SwitchboardTable: React.FC = () => {
  const [data, setData] = useState([] as Data[]);
  const [loading, setLoading] = useState(true);

  const updateFilter = (contents: string) => {
    setData(
      data.map(row => {
        if (row.name.toLowerCase().includes(contents.toLowerCase())) {
          return { ...row, hide: false };
        } else {
          return { ...row, hide: true };
        }
      })
    );
  };

  useEffect(() => {
    (async () => {
      let switchboardData = { groups: [] };
      const response = await fetch("/prod" + API_ENDPOINTS.SWITCHBOARD_DATA);
      if (!response.ok) {
        console.error(
          `Error fetching switchboard data from ${API_ENDPOINTS.SWITCHBOARD_DATA}: ${response.statusText}`
        );
      } else {
        switchboardData = await response.json();
        setData(switchboardData.groups);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <SearchBar updateFilter={updateFilter} />
      <Table variant={"dark"} striped hover responsive>
        <thead>
          <tr>
            <th style={{ width: "30px" }}>Switch</th>
            <th>CloudFormation Stack</th>
            <th>Stage</th>
            <th>ASG Name</th>
            <th>Minimum Size</th>
            <th>Desired Capacity</th>
            <th>Maximum Size</th>
            <th>Alive</th>
          </tr>
        </thead>
        {loading ? (
          <tbody
            style={{
              marginTop: "30px",
              textAlign: "center",
              position: "absolute",
              width: "100%"
            }}
          >
            <Spinner animation={"grow"} variant={"light"} />
          </tbody>
        ) : (
          <tbody>
            {data
              .filter(d => !d.hide)
              .map(row => (
                <TableRow
                  groupProp={row.group}
                  key={row.group.AutoScalingGroupName}
                />
              ))}
          </tbody>
        )}
      </Table>
    </div>
  );
};
