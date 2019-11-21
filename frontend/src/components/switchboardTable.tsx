import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { fetchSwitchboardData } from "../utils/switchboardBuilder";
import { EnrichedAutoScalingGroup } from "../utils/interfaces";
import AutoScaling from "aws-sdk/clients/autoscaling";

function getTagValue(group: AutoScaling.AutoScalingGroup, key: string) {
  return group.Tags ? group.Tags.filter(t => t.Key === key)[0].Value : "";
}

function assessAlive(group: AutoScaling.AutoScalingGroup): boolean {
  return group.MinSize > 0;
}

function scale(min: number, desired: number, max: number) {
  console.log("Would scale: ", min, desired, max);
}

const SwitchboardTable: React.FC = () => {
  let initialState: EnrichedAutoScalingGroup[] = [];

  const [data, setData] = useState(initialState);

  const GetRows = async () => {
    let rowData: EnrichedAutoScalingGroup[];
    try {
      rowData = await fetchSwitchboardData();
    } catch (e) {
      console.error(e);
      rowData = [];
    }
    setData(rowData);
  };

  useEffect(() => {
    GetRows();
  }, []);

  return (
    <div>
      <Table variant={"dark"} bordered striped hover responsive>
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
                  <tr key={group.AutoScalingGroupName}>
                    <td>{getTagValue(group, "Stack")}</td>
                    <td>{getTagValue(group, "Stage")}</td>
                    <td>{group.AutoScalingGroupName}</td>
                    <td>{group.MinSize}</td>
                    <td>{group.DesiredCapacity}</td>
                    <td>{group.MaxSize}</td>
                    <td>
                      {assessAlive(group) ? (
                        <div style={{ color: "lightgreen" }}>Yes!</div>
                      ) : (
                        <div style={{ color: "palevioletred" }}>No.</div>
                      )}
                    </td>
                    <td>
                      {assessAlive(group) ? (
                        <Button
                          variant={"warning"}
                          onClick={() => scale(0, 0, 0)}
                        >
                          Scale down
                        </Button>
                      ) : (
                        <Button
                          variant={"primary"}
                          onClick={() => scale(3, 3, 6)}
                        >
                          Scale up
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            : undefined}
        </tbody>
      </Table>
    </div>
  );
};

export default SwitchboardTable;
