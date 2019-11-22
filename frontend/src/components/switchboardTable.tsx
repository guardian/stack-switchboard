import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

import { TableRow } from "./tableRow";
import { EnrichedAutoScalingGroup } from "../utils/interfaces";

export const SwitchboardTable: React.FC = () => {
  const [data, setData] = useState([] as EnrichedAutoScalingGroup[]);

  useEffect(() => {
    (async () => {
      let switchboardData: { groups: EnrichedAutoScalingGroup[] } = {
        groups: []
      };
      const response = await fetch("/api/switchboard");
      if (!response.ok) {
        console.error(response.statusText);
      } else {
        switchboardData = await response.json();
        setData(switchboardData.groups);
      }
    })();
  }, []);

  return (
    <div>
      <Table variant={"dark"} striped hover responsive>
        <thead>
          <tr>
            <th scope="col">CloudFormation Stack</th>
            <th scope="col">Stage</th>
            <th scope="col">ASG Name</th>
            <th scope="col" className="th-md">
              Minimum Size
            </th>
            <th scope="col" className="th-md">
              Desired Capacity
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
        <tbody>
          {data.length > 0
            ? data.map((row: EnrichedAutoScalingGroup) => {
                const { group } = row;
                return (
                  <TableRow
                    groupProp={group}
                    key={group.AutoScalingGroupName}
                  />
                );
              })
            : undefined}
        </tbody>
      </Table>
    </div>
  );
};
