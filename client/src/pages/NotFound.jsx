import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const NotFound = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mb-4 text-xl text-muted-foreground">Page Not Found</p>
            <Link to="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
