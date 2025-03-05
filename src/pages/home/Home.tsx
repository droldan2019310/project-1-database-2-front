import React, { useEffect, useState } from "react";
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
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
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
import { useGetBadDistributedBranches, useGetLongestTimeRoute, useGetMostLoadedRoute, useGetMostPurchasedProduct, useGetTopProviders, useGetTopSalesBranchOffices } from "../../hooks/useStats";
import { CircularProgress } from "@mui/material";

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


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d0ed57"];


const Home: React.FC = () => {

  const { data: branches, loading, error } = useGetBadDistributedBranches();

  // Preparamos los datos para el gráfico de barras
  const chartDataBranches = branches.map((item) => ({
    branchName: item.branchOffice.Name,
    distance: item.route.Distance_KM,
  }));


  const { branchOffices } = useGetTopSalesBranchOffices();
  const [chartDataTop5, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (branchOffices.length > 0) {
      const formattedData = branchOffices.map((branch, index) => ({
        branchName: branch.Name,
        salesCount: branch.salesCount,
      }));

      setChartData(formattedData);
    }
  }, [branchOffices]);

  const { route, } = useGetMostLoadedRoute()
  const [mostLoadedRoute, setMostLoadedRoute] = useState<string>("Cargando...");
  const [mostLoadedDistance, setMostLoadedDistance] = useState<string>("...");

  useEffect(() => {
    if (route) {
      setMostLoadedRoute(route.Name);
      setMostLoadedDistance(`${route.Distance_KM} KM`);
    }
    
  }, [route]);

  
  const { product: mostPurchasedProduct, loading: loadingMostPurchasedProduct } = useGetMostPurchasedProduct();
  const { route:routeCard, deliveryName, arriveDate } = useGetLongestTimeRoute();


  const cards = [
    
    {
      icon: "nc-icon nc-delivery-fast text-primary",
      category: "Ruta más cargada",
      value: loading ? "Cargando..." : mostLoadedRoute,
      footer: `${mostLoadedDistance}`,
      footerIcon: "fas fa-road mr-1",
    },
    {
      icon: "nc-icon nc-tag-content text-success",
      category: "Producto más comprado",
      value: loadingMostPurchasedProduct ? "Cargando..." : mostPurchasedProduct?.Name || "N/A",
      footer: `Comprado ${mostPurchasedProduct?.purchaseCount || 0} veces`,
      footerIcon: "fas fa-shopping-cart mr-1",
    },
    {
      icon: "nc-icon nc-time-alarm text-danger",
      category: "Ruta más larga (tiempo)",
      value: loading ? "Cargando..." : deliveryName,
      footer: `${routeCard}`,
      footerIcon: "fas fa-clock mr-1",
    },
  ];


  const { topProviders } = useGetTopProviders();
    const [chartDataProviders, setChartDataProviders] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        if (topProviders.length > 0) {
            const formattedData = topProviders.map(provider => ({
                name: provider.provider,
                value: provider.sales
            }));
            setChartDataProviders(formattedData);
        }
  }, [topProviders]);


  return (
    <Container fluid>
      <Row>
        {cards.map((item, index) => (
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
            <CardHeader>
              <CardTitle as="h4">Top 5 Sucursales con Más Ventas</CardTitle>
              <p className="card-category">Ventas totales históricas</p>
            </CardHeader>

            <CardBody>
              {loading ? (
                <p>Cargando datos...</p>
              ) : error ? (
                <p style={{ color: "red" }}>Error: {error}</p>
              ) : (
                <ResponsiveContainer width="100%" height={245}>
                  <LineChart data={chartDataTop5} margin={{ right: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="branchName"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="salesCount"
                      stroke="#8884d8"
                      name="Ventas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardBody>

            <CardFooter>
              <div className="legend">
                <i className="fas fa-circle text-info"></i> Ventas Totales
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-history"></i> Actualizado hace unos minutos
              </div>
            </CardFooter>
          </Card>
        </Col>

        <Col md="4">
            <Card>
                <Card.Header>
                    <Card.Title as="h4">Top Proveedores</Card.Title>
                    <p className="card-category">Proveedores con más ventas</p>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <p>Cargando...</p>
                    ) : error ? (
                        <p style={{ color: "red" }}>{error}</p>
                    ) : (
                        <div className="ct-chart ct-perfect-fourth" id="chartPreferences">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartDataProviders}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#82ca9d"
                                        label
                                    >
                                        {chartDataProviders.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <hr />
                    <div className="stats">
                        <i className="far fa-clock"></i> Datos actualizados recientemente
                    </div>
                </Card.Body>
            </Card>
        </Col>
      </Row>

      <Row>
        <Col md="6">
        <Card>
            <Card.Header>
              <Card.Title as="h4">Sucursales con Mala Distribución</Card.Title>
              <p className="card-category">Distancia excesiva ( 1900 KM)</p>
            </Card.Header>
            <Card.Body style={{ height: 300 }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <CircularProgress />
                </div>
              ) : error ? (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataBranches} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branchName" angle={-45} textAnchor="end" height={70} />
                    <YAxis
                      domain={[1900, 2000]} 
                      tickCount={5}         
                    />
                    <Tooltip />
                    <Bar dataKey="distance" fill="#8884d8" name="Distancia (KM)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
            <Card.Footer>
              <div className="legend">
                <i className="fas fa-chart-bar"></i> Distancia de la ruta por sucursal
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-history"></i> Actualizado en tiempo real
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
