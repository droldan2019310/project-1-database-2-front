import React from "react";
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
} from "react-bootstrap";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip
  } from "recharts";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
  } from "recharts";

import {
  BarChart,
  Bar,
  Legend,
} from "recharts";

const data = [
    { time: "9:00AM", series1: 287, series2: 67, series3: 23 },
    { time: "12:00AM", series1: 385, series2: 152, series3: 113 },
    { time: "3:00PM", series1: 490, series2: 143, series3: 67 },
    { time: "6:00PM", series1: 492, series2: 240, series3: 108 },
    { time: "9:00PM", series1: 554, series2: 287, series3: 190 },
    { time: "12:00PM", series1: 586, series2: 335, series3: 239 },
    { time: "3:00AM", series1: 698, series2: 435, series3: 307 },
    { time: "6:00AM", series1: 695, series2: 437, series3: 308 },
];

const dataPie = [
    { name: "Open", value: 40 },
    { name: "Bounce", value: 20 },
    { name: "Unsubscribe", value: 40 },
];
const COLORS = ["#8884d8", "#ff4c4c", "#ffc658"]; 

const dataBar = [
    { month: "Jan", series1: 542, series2: 412 },
    { month: "Feb", series1: 443, series2: 243 },
    { month: "Mar", series1: 320, series2: 280 },
    { month: "Apr", series1: 780, series2: 580 },
    { month: "Mai", series1: 553, series2: 453 },
    { month: "Jun", series1: 453, series2: 353 },
    { month: "Jul", series1: 326, series2: 300 },
    { month: "Aug", series1: 434, series2: 364 },
    { month: "Sep", series1: 568, series2: 368 },
    { month: "Oct", series1: 610, series2: 410 },
    { month: "Nov", series1: 756, series2: 636 },
    { month: "Dec", series1: 895, series2: 695 },
];

const Home: React.FC = () => {
  return (
    <Container fluid>
      <Row>
        {[
          {
            icon: "nc-icon nc-chart text-warning",
            category: "Number",
            value: "150GB",
            footer: "Update Now",
            footerIcon: "fas fa-redo mr-1",
          },
          {
            icon: "nc-icon nc-light-3 text-success",
            category: "Revenue",
            value: "$ 1,345",
            footer: "Last day",
            footerIcon: "far fa-calendar-alt mr-1",
          },
          {
            icon: "nc-icon nc-vector text-danger",
            category: "Errors",
            value: "23",
            footer: "In the last hour",
            footerIcon: "far fa-clock-o mr-1",
          },
          {
            icon: "nc-icon nc-favourite-28 text-primary",
            category: "Followers",
            value: "+45K",
            footer: "Update now",
            footerIcon: "fas fa-redo mr-1",
          },
        ].map((item, index) => (
          <Col lg="3" sm="6" key={index}>
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className={item.icon}></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">{item.category}</p>
                      <Card.Title as="h4">{item.value}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className={item.footerIcon}></i> {item.footer}
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Users Behavior</Card.Title>
              <p className="card-category">24 Hours performance</p>
            </Card.Header>
            <Card.Body>
                <ResponsiveContainer width="100%" height={245}>
                    <LineChart data={data} margin={{ right: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 800]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="series1" stroke="#8884d8" name="Open" />
                        <Line type="monotone" dataKey="series2" stroke="#82ca9d" name="Click" />
                        <Line
                        type="monotone"
                        dataKey="series3"
                        stroke="#ffc658"
                        name="Click Second Time"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card.Body>
            <Card.Footer>
              <div className="legend">
                <i className="fas fa-circle text-info"></i> Open{" "}
                <i className="fas fa-circle text-danger"></i> Click{" "}
                <i className="fas fa-circle text-warning"></i> Click Second Time
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-history"></i> Updated 3 minutes ago
              </div>
            </Card.Footer>
          </Card>
        </Col>

        <Col md="4">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Email Statistics</Card.Title>
              <p className="card-category">Last Campaign Performance</p>
            </Card.Header>
            <Card.Body>
              <div className="ct-chart ct-perfect-fourth" id="chartPreferences">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d" label />
                    </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                <i className="fas fa-circle text-info"></i> Open{" "}
                <i className="fas fa-circle text-danger"></i> Bounce{" "}
                <i className="fas fa-circle text-warning"></i> Unsubscribe
              </div>
              <hr />
              <div className="stats">
                <i className="far fa-clock"></i> Campaign sent 2 days ago
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">2017 Sales</Card.Title>
              <p className="card-category">All products including Taxes</p>
            </Card.Header>
            <Card.Body>
                <ResponsiveContainer width="100%" height={245}>
                    <BarChart data={dataBar} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="series1" fill="#8884d8" name="Tesla Model S" />
                        <Bar dataKey="series2" fill="#82ca9d" name="BMW 5 Series" />
                    </BarChart>
                </ResponsiveContainer>
            </Card.Body>
            <Card.Footer>
              <div className="legend">
                <i className="fas fa-circle text-info"></i> Tesla Model S{" "}
                <i className="fas fa-circle text-danger"></i> BMW 5 Series
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-check"></i> Data information certified
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
