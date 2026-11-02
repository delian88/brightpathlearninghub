"use client";

import React, { useState } from "react";
import type { AdminSystemUser, LmsStateData } from "@/lib/lmsData";
import type { ToastType } from "./ToastNotification";
import { Shield, UserPlus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";

interface AdminUserManagementProps {
  lmsData: LmsStateData;
  onRefresh: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

const DEFAULT_USERS: AdminSystemUser[] = [
  {
    id: "user-superadmin-1",
    name: "Primary Administrator",
    email: "brightpathlearninghub6@gmail.com",
    role: "super_admin",
    status: "active",
    phone: "+234 806 320 2616",
    permissions: {
      canManageHomework: true,
      canManageProgress: true,
      canManageReports: true,
      canManageCampus: true,
      canManageCMS: true,
      canManageUsers: true,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-teacher-1",
    name: "Academic Lead Teacher",
    email: "teacher.lead@brightpath.org",
    role: "teacher",
    status: "active",
    phone: "+234 803 123 4567",
    permissions: {
      canManageHomework: true,
      canManageProgress: true,
      canManageReports: true,
      canManageCampus: true,
      canManageCMS: false,
      canManageUsers: false,
    },
    createdAt: new Date().toISOString(),
  },
];

export default function AdminUserManagement({
  lmsData,
  onRefresh,
  showToast,
}: AdminUserManagementProps) {
  const users: AdminSystemUser[] =
    lmsData.adminUsers && lmsData.adminUsers.length > 0
      ? lmsData.adminUsers
      : DEFAULT_USERS;

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"super_admin" | "admin" | "teacher" | "support">("teacher");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [permissions, setPermissions] = useState({
    canManageHomework: true,
    canManageProgress: true,
    canManageReports: true,
    canManageCampus: true,
    canManageCMS: false,
    canManageUsers: false,
  });

  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("teacher");
    setStatus("active");
    setPermissions({
      canManageHomework: true,
      canManageProgress: true,
      canManageReports: true,
      canManageCampus: true,
      canManageCMS: false,
      canManageUsers: false,
    });
  };

  const handleStartEdit = (user: AdminSystemUser) => {
    setIsEditing(true);
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    setStatus(user.status);
    setPermissions(
      user.permissions || {
        canManageHomework: true,
        canManageProgress: true,
        canManageReports: true,
        canManageCampus: true,
        canManageCMS: false,
        canManageUsers: false,
      }
    );
  };

  const handleRoleChange = (selectedRole: "super_admin" | "admin" | "teacher" | "support") => {
    setRole(selectedRole);
    if (selectedRole === "super_admin") {
      setPermissions({
        canManageHomework: true,
        canManageProgress: true,
        canManageReports: true,
        canManageCampus: true,
        canManageCMS: true,
        canManageUsers: true,
      });
    } else if (selectedRole === "admin") {
      setPermissions({
        canManageHomework: true,
        canManageProgress: true,
        canManageReports: true,
        canManageCampus: true,
        canManageCMS: true,
        canManageUsers: false,
      });
    } else if (selectedRole === "teacher") {
      setPermissions({
        canManageHomework: true,
        canManageProgress: true,
        canManageReports: true,
        canManageCampus: true,
        canManageCMS: false,
        canManageUsers: false,
      });
    } else if (selectedRole === "support") {
      setPermissions({
        canManageHomework: false,
        canManageProgress: false,
        canManageReports: false,
        canManageCampus: true,
        canManageCMS: false,
        canManageUsers: false,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast("Please enter user name and email address.", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-admin-user",
          id: editingId || undefined,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          status,
          permissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || "User account saved successfully!", "success");
        resetForm();
        onRefresh();
      } else {
        showToast(data.message || "Failed to save user.", "error");
      }
    } catch {
      showToast("Connection error while saving team member.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove team member "${userName}"?`)) return;

    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-admin-user",
          userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "User removed.", "success");
        onRefresh();
      } else {
        showToast(data.message || "Could not delete user.", "error");
      }
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #071527 0%, #133e87 100%)",
          borderRadius: 16,
          padding: "24px 22px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              background: "rgba(251, 191, 36, 0.2)",
              color: "#fbbf24",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            CONTROL CENTER ACCESS
          </span>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>
            User Management & Role Permissions
          </h2>
          <p style={{ margin: "4px 0 0", color: "#cbd5e1", fontSize: "0.85rem" }}>
            Add teachers, staff, or co-administrators with granular access permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsEditing(true);
          }}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <UserPlus size={16} /> Add Team Member
        </button>
      </div>

      {/* Editor Modal / Inline Form */}
      {isEditing && (
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #0284c7",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              {editingId ? "Edit Team Member & Permissions" : "Create New Team Member Account"}
            </h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetForm}
              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mrs. Sarah Oladipo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work / Notification Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="sarah.oladipo@brightpath.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                >
                  <option value="teacher">Class Teacher / Instructor</option>
                  <option value="admin">Administrator</option>
                  <option value="support">Help Desk & Support</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Suspended / Inactive</option>
                </select>
              </div>
            </div>

            {/* Granular Permission Checklist */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>
                🔒 Granular Feature Permissions
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {[
                  { key: "canManageHomework", label: "Create & Grade Homework", desc: "Build assignments, auto-grading, review written/audio answers" },
                  { key: "canManageProgress", label: "Student Progress & AI Logs", desc: "View diagnostics, AI buddy speech attempts, competency mastery" },
                  { key: "canManageReports", label: "Generate Academic PDF Reports", desc: "Compile termly report cards and publish to student portal" },
                  { key: "canManageCampus", label: "Campus & Calendar Events", desc: "Manage timetable, attendance, materials, messages & events" },
                  { key: "canManageCMS", label: "Landing Page CMS Editor", desc: "Edit website banners, prices, curriculum rows and FAQs" },
                  { key: "canManageUsers", label: "User Management Access", desc: "Add, edit, or remove staff members and change role permissions" },
                ].map((perm) => (
                  <label
                    key={perm.key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[perm.key as keyof typeof permissions])}
                      onChange={(e) =>
                        setPermissions({
                          ...permissions,
                          [perm.key]: e.target.checked,
                        })
                      }
                      style={{ marginTop: 2, accentColor: "#0284c7" }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                        {perm.label}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {perm.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving Member..." : editingId ? "Update Team Member" : "Save New Member"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Directory Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
            Staff & Educator Directory ({users.length})
          </h3>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Role-Based Access Control (RBAC) Enabled
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                <th style={{ padding: "12px 18px" }}>Name / Contact</th>
                <th style={{ padding: "12px 18px" }}>System Role</th>
                <th style={{ padding: "12px 18px" }}>Status</th>
                <th style={{ padding: "12px 18px" }}>Permissions Matrix</th>
                <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleBadgeColor =
                  u.role === "super_admin"
                    ? "#dc2626"
                    : u.role === "admin"
                    ? "#0284c7"
                    : u.role === "teacher"
                    ? "#059669"
                    : "#64748b";

                const roleLabel =
                  u.role === "super_admin"
                    ? "Super Admin"
                    : u.role === "admin"
                    ? "Administrator"
                    : u.role === "teacher"
                    ? "Class Teacher"
                    : "Support Desk";

                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{u.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{u.email}</div>
                      {u.phone && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{u.phone}</div>}
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: `${roleBadgeColor}15`,
                          color: roleBadgeColor,
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          padding: "3px 10px",
                          borderRadius: 999,
                        }}
                      >
                        <Shield size={12} /> {roleLabel}
                      </span>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      {u.status === "active" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#059669", fontWeight: 700, fontSize: "0.78rem" }}>
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#94a3b8", fontWeight: 700, fontSize: "0.78rem" }}>
                          <XCircle size={14} /> Suspended
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {u.permissions?.canManageHomework && (
                          <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>
                            Homework
                          </span>
                        )}
                        {u.permissions?.canManageProgress && (
                          <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>
                            Progress
                          </span>
                        )}
                        {u.permissions?.canManageReports && (
                          <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>
                            Reports
                          </span>
                        )}
                        {u.permissions?.canManageCampus && (
                          <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>
                            Campus & Calendar
                          </span>
                        )}
                        {u.permissions?.canManageCMS && (
                          <span style={{ background: "#eff6ff", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#1d4ed8" }}>
                            CMS
                          </span>
                        )}
                        {u.permissions?.canManageUsers && (
                          <span style={{ background: "#fef2f2", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, color: "#dc2626" }}>
                            Users
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleStartEdit(u)}
                          style={{ padding: "4px 8px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        {u.role !== "super_admin" && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleDelete(u.id, u.name)}
                            style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

