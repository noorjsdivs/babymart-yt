import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BabyShop E-commerce API",
      version: "1.0.0",
      description:
        "A comprehensive e-commerce API for managing products, orders, users, and analytics",
      contact: {
        name: "API Support",
        email: "support@babyshop.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-domain.com"
            : "http://localhost:8000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            avatar: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            category: { type: "string" },
            brand: { type: "string" },
            images: { type: "array", items: { type: "string" } },
            featured: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" },
                  image: { type: "string" },
                },
              },
            },
            total: { type: "number" },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
                country: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { $ref: "#/components/schemas/Product" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                },
              },
            },
            totalPrice: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Brand: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Banner: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            subtitle: { type: "string" },
            image: { type: "string" },
            buttonText: { type: "string" },
            buttonLink: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
            orderItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { $ref: "#/components/schemas/Product" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                },
              },
            },
            shippingAddress: {
              type: "object",
              properties: {
                address: { type: "string" },
                city: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
            },
            paymentMethod: {
              type: "string",
              enum: ["PayPal", "Stripe", "CashOnDelivery"],
            },
            paymentResult: {
              type: "object",
              properties: {
                id: { type: "string" },
                status: { type: "string" },
                update_time: { type: "string" },
                email_address: { type: "string" },
              },
            },
            itemsPrice: { type: "number" },
            taxPrice: { type: "number" },
            shippingPrice: { type: "number" },
            totalPrice: { type: "number" },
            isPaid: { type: "boolean" },
            paidAt: { type: "string", format: "date-time" },
            isDelivered: { type: "boolean" },
            deliveredAt: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                totalProducts: { type: "number" },
                totalOrders: { type: "number" },
                totalUsers: { type: "number" },
                totalRevenue: { type: "number" },
              },
            },
            sales: {
              type: "object",
              properties: {
                bestSellingProducts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      productName: { type: "string" },
                      totalSold: { type: "number" },
                      totalRevenue: { type: "number" },
                    },
                  },
                },
                recentOrders: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
                monthlyRevenue: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      revenue: { type: "number" },
                      orders: { type: "number" },
                    },
                  },
                },
                orderStatusBreakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      count: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            stack: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { specs };
export default specs;
