# MVP Product Management Tool

MVP Product Management Tool is a web-based application designed to streamline product lifecycle management with role-based access control. It enables Admins, Product Managers, and Stakeholders to efficiently collaborate on product development and status tracking.
---
**Application url**: [TRL-Driven MVP Tracker](https://trl-two.vercel.app/) 
---
## Features

- Role-based authentication and dashboards for Admin, Product Manager, and Stakeholder
- Admin capabilities to manage users and assign products and stakeholders
- Product Managers can view and update assigned products and read-only statuses of others product(if access available)
- Stakeholders can view product statuses and update them if permitted by Admin
- Clear status control and access permission management
- Simple, intuitive user interface for seamless interaction

---

## User Roles & Permissions

| Role            | Capabilities                                                                                      |
|-----------------|-------------------------------------------------------------------------------------------------|
| **Admin**       | Create accounts, assign products and stakeholders, control product statuses and access rights    |
| **Product Manager** | View/update assigned products, view others’ product statuses (read-only)                        |
| **Stakeholder** | View assigned products, update statuses if permission granted                                   |

## User journey
![TRL](https://github.com/user-attachments/assets/a5889978-439f-413e-a067-26a095124502)

---

### Installation

Clone the repository:
```bash
git clone https://github.com/naveenmvoff/TRL.git
cd TRL
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
```bash
NEXTAUTH_URL=your-app-base-url
NEXT_PUBLIC_API_URL=your-api-base-url
MONGODB_URI=your-mongodb-connection-uri
NEXTAUTH_SECRET=your-randomly-generated-secret
```

Run the server:
```bash
npm start
```
