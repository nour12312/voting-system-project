graph TD
    A[Voter (Browser)]
    B[React Frontend]
    C[Express Backend]
    D[MongoDB Database]

    subgraph Security Layers
        E1[JWT Authentication]
        E2[Helmet Middleware]
        E3[Environment Variables]
        E4[bcrypt Password Hashing]
        E5[CORS Policy]
    end

    A -->|HTTPS, CORS Restricted| B
    B -->|API Calls (JWT Token)| C
    C -->|Mongoose ODM| D

    C --> E1
    C --> E2
    C --> E3
    C --> E4
    B --> E5
