import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

import { TableRow } from "./tableRow";
import { EnrichedAutoScalingGroup } from "../utils/interfaces";
import Spinner from "react-bootstrap/Spinner";
import { API_ENDPOINTS } from "../utils/values";

export const SwitchboardTable: React.FC = () => {
  const [data, setData] = useState([] as EnrichedAutoScalingGroup[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let switchboardData: { groups: EnrichedAutoScalingGroup[] } = {
        groups: []
      };
      const response = await fetch(API_ENDPOINTS.SWITCHBOARD_DATA);
      if (!response.ok) {
        console.error(response.statusText);
      } else {
        switchboardData = await response.json();
        setData(switchboardData.groups);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Spinner animation={"grow"} variant={"light"} />
        </div>
      ) : (
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
          <tbody>
            {data.length > 0
              ? data.map((row: EnrichedAutoScalingGroup) => (
                  <TableRow
                    groupProp={row.group}
                    key={row.group.AutoScalingGroupName}
                  />
                ))
              : undefined}
          </tbody>
        </Table>
      )}
    </div>
  );
};
