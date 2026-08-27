import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Database, Key, Globe, Book, Download } from "lucide-react";
import Header from "@/components/Header";

const Developer = () => {
  const endpoints = [
    {
      method: "GET",
      path: "/api/hospitals",
      description: "Get list of all hospitals with bed availability",
      params: "?location={lat,lng}&radius={km}"
    },
    {
      method: "GET",
      path: "/api/hospitals/{id}",
      description: "Get specific hospital details",
      params: "hospital ID in path"
    },
    {
      method: "GET",
      path: "/api/bloodbanks",
      description: "Get list of all blood banks with availability",
      params: "?location={lat,lng}&radius={km}"
    },
    {
      method: "GET",
      path: "/api/bloodbanks/{id}",
      description: "Get specific blood bank details",
      params: "blood bank ID in path"
    },
    {
      method: "POST",
      path: "/api/hospitals",
      description: "Create new hospital (Admin only)",
      params: "Requires API key authentication"
    },
    {
      method: "PUT",
      path: "/api/hospitals/{id}/beds",
      description: "Update hospital bed availability (Admin only)",
      params: "Requires API key authentication"
    },
    {
      method: "PUT",
      path: "/api/bloodbanks/{id}/inventory",
      description: "Update blood bank inventory (Admin only)",
      params: "Requires API key authentication"
    }
  ];

  const responseExample = `{
  "hospitals": [
    {
      "id": "hosp_001",
      "name": "City General Hospital",
      "address": "123 Health Street, Downtown",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "phone": "(555) 123-4567",
      "status": "open",
      "beds": {
        "icu": {
          "available": 5,
          "total": 20
        },
        "general": {
          "available": 15,
          "total": 50
        },
        "emergency": {
          "available": 3,
          "total": 10
        }
      },
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "radius": 10,
    "center": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            HealthFinder API Documentation
          </h1>
          <p className="text-xl text-muted-foreground">
            Integrate healthcare data into your applications
          </p>
        </div>

        <Tabs defaultValue="overview" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>API Overview</span>
                </CardTitle>
                <CardDescription>
                  RESTful API for accessing real-time healthcare facility data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary-soft p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Base URL</h4>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      https://api.healthfinder.com/v1
                    </code>
                  </div>
                  <div className="bg-success-soft p-4 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Rate Limit</h4>
                    <p className="text-sm">1000 requests/hour for free tier</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Include your API key in the request header:
                  </p>
                  <code className="text-sm bg-background p-3 rounded block">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-primary" />
                    <span>Real-time Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access live hospital bed availability and blood bank inventory updated every 15 minutes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-success" />
                    <span>Geolocation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Find facilities by coordinates, address, or ZIP code with customizable search radius.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-warning" />
                    <span>Secure Access</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with API key authentication and HTTPS encryption.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <Badge 
                        variant={endpoint.method === "GET" ? "default" : endpoint.method === "POST" ? "secondary" : "outline"}
                        className={
                          endpoint.method === "GET" 
                            ? "bg-success text-success-foreground" 
                            : endpoint.method === "POST"
                            ? "bg-primary text-primary-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </CardTitle>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <strong>Parameters:</strong> {endpoint.params}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Example</CardTitle>
                <CardDescription>Sample response from /api/hospitals endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted/50 p-4 rounded-lg overflow-x-auto">
                  <code>{responseExample}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">JavaScript/Node.js</h4>
                  <pre className="text-sm bg-muted/50 p-4 rounded-lg">
                    <code>{`const response = await fetch('https://api.healthfinder.com/v1/hospitals', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const hospitals = await response.json();`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Python</h4>
                  <pre className="text-sm bg-muted/50 p-4 rounded-lg">
                    <code>{`import requests

headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.get('https://api.healthfinder.com/v1/hospitals', headers=headers)
hospitals = response.json()`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sdks" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>JavaScript SDK</span>
                  </CardTitle>
                  <CardDescription>
                    Official SDK for web and Node.js applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="text-sm bg-muted/50 p-3 rounded">
                    <code>npm install healthfinder-js</code>
                  </pre>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download SDK
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Python SDK</span>
                  </CardTitle>
                  <CardDescription>
                    Official SDK for Python applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="text-sm bg-muted/50 p-3 rounded">
                    <code>pip install healthfinder-python</code>
                  </pre>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download SDK
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5" />
                  <span>Additional Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Book className="w-4 h-4 mr-2" />
                    Complete Documentation
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Code className="w-4 h-4 mr-2" />
                    Interactive API Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Developer;