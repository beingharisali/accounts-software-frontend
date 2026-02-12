import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Users, Loader2 } from "lucide-react";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); // For creation button
    const [initialLoading, setInitialLoading] = useState(true); // For initial list fetch
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "CSR" });

    // 1. Fetch Users List
    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch (err) {
            toast.error("Could not load users list.");
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Create Staff Logic
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/create-staff", formData);
            toast.success(`${formData.role} created successfully!`);
            setFormData({ name: "", email: "", password: "", role: "CSR" });
            fetchUsers(); // Refresh the list
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Creation failed.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete Staff Logic
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/auth/user/${id}`);
            toast.success("User deleted.");
            fetchUsers(); // Refresh the list
        } catch (err) {
            toast.error("Failed to delete user.");
        }
    };

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center gap-2 border-b pb-4">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold italic">User Management</h1>
            </div>

            {/* CREATE FORM SECTION */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                    <UserPlus className="w-4 h-4" /> Add New Staff (CSR / Officer)
                </h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium ml-1">Full Name</label>
                        <Input
                            placeholder="e.g. Ali Ahmed"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium ml-1">Email Address</label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium ml-1">Password</label>
                        <Input
                            type="password"
                            placeholder="Min 6 characters"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium ml-1">Select Role</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="CSR">CSR</option>
                            <option value="OFFICER">OFFICER</option>
                        </select>
                    </div>
                    <Button disabled={loading} className="md:col-span-4 mt-2">
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                        ) : (
                            "Create Staff Member"
                        )}
                    </Button>
                </form>
            </div>

            {/* LIST TABLE SECTION */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/20 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> Registered Staff Members
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-4 font-semibold text-sm">Name</th>
                                <th className="p-4 font-semibold text-sm">Email</th>
                                <th className="p-4 font-semibold text-sm">Role</th>
                                <th className="p-4 text-right font-semibold text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {initialLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading staff list...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No staff members found. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{user.name}</td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${user.role === 'OFFICER'
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    : 'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(user._id)}
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}