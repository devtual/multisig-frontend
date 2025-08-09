"use client";
import { useState } from "react";
import ownerService from "@/services/owner-service";
import { addOwnerSchema } from "@/schemas";
import Input from "./Input";
import { Send } from "lucide-react";

export default function AddOwnerForm() {
    const [formData, setFormData] = useState({ name: "", email: "", address: "" });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isError, setIsError] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true)

        setMessage("");
        setErrors({});
        setIsError(false);

        const result = addOwnerSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};

            result.error.issues.forEach((err: any) => {
                if (err.path.length > 0) fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            setIsSubmitted(false)
            return;
        }

        const res = await ownerService.addOwner(formData);
        if (!res.status) {
            setMessage(res.message!);
            setIsError(true)
        } else {
            setMessage("Request sent successfully! Status: pending");
            setFormData({ name: "", email: "", address: "" });
        }

        setIsSubmitted(false)
    };

    return (
        <div className="flex items-center justify-center px-4 pt-10 z-50">
            <div className="border border-gray-700 bg-gray-800 overflow-hidden rounded-2xl shadow-xl w-full max-w-lg px-6 py-10 relative">
                <h1 className="text-2xl font-bold mb-4">Add Owner Request</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <Input
                            type="text"
                            name="address"
                            placeholder="ETH / Wallet Address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-600 mt-1">{errors.address}</p>}
                    </div>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                        disabled={isSubmitted}
                    >
                        {isSubmitted ? "Loading..." : "Submit"}
                    </button>
                </form>
                {message && <p className={isError ? "mt-4 text-red-600" : "mt-4 text-green-600"}>{message}</p>}
            </div>
        </div>
    );
}
