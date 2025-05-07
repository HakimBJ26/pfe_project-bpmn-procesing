import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ConfigTaskForm } from "@/views/workflows/config/components/config-task-form";
import { ConfigGatewayFlowsForm } from "@/views/workflows/config/components/config-gateway-flows-form";
import { Toaster } from "./ui/sonner";

interface DialogContainerProps {
    title: string;
    trigger: ReactNode;
    onSubmit: (payload: any) => void;
    type: 'form' | 'service' | 'gateway';
    formTitle: string;
    gateway?: any;
    defaultValue?: string;
}

export default function DialogContainer({ 
    title, 
    trigger, 
    type, 
    formTitle, 
    onSubmit, 
    gateway,
    defaultValue 
}: DialogContainerProps) {
    const [open, setOpen] = useState(false);

    const handleSubmit = (title: string) => { 
        onSubmit(title); 
        setOpen(false); 
    };
    
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    {type !== "gateway" && (
                        <ConfigTaskForm 
                            onSubmit={handleSubmit} 
                            type={type} 
                            title={formTitle} 
                            defaultValue={defaultValue}
                        />
                    )}
                    {type === "gateway" && (
                        <ConfigGatewayFlowsForm 
                            onSubmit={handleSubmit} 
                            title={formTitle} 
                            gateway={gateway} 
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Toaster />
        </>
    );
}