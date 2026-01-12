"use client";

import { useState, useTransition } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaInstagram } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import { saveInstagramAccount, deleteInstagramAccount } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface InstagramSectionProps {
  initialAccount: { username: string } | null;
}

export default function InstagramSection({ initialAccount }: InstagramSectionProps) {
  const [account, setAccount] = useState(initialAccount);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleAddAccount = () => {
    if (account) return;
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    startTransition(async () => {
      try {
        await saveInstagramAccount(username.trim(), password);
        setAccount({ username: username.trim() });
        setShowModal(false);
        setUsername("");
        setPassword("");
      } catch {
        setError("Failed to save account. Please try again.");
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInstagramAccount();
      setAccount(null);
    } catch {
      setError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-12 w-full max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Instagram Account</h2>
            <p className="text-sm text-muted-foreground">
              Connect your Instagram account to send DMs
            </p>
          </div>
          <button
            onClick={handleAddAccount}
            disabled={!!account}
            className={`rounded-xl border border-border px-4 py-2 text-sm transition-opacity ${
              account
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:opacity-70 active:scale-95"
            }`}
          >
            Add Account
          </button>
        </div>

        {account && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <FaInstagram className="text-white" size={20} />
              </div>
              <div>
                <p className="font-medium">@{account.username}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <IoCheckmarkCircle size={14} />
                  <span>Connected</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? <PulseLoader color="#ef4444" size={4} /> : "Delete"}
            </button>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          setUsername("");
          setPassword("");
          setError("");
        }
      }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <FaInstagram className="text-white" size={20} />
              </div>
              <div>
                <DialogTitle>Connect Instagram</DialogTitle>
                <DialogDescription>
                  Enter your Instagram credentials
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="w-full rounded-xl border border-border px-4 py-2 outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-border px-4 py-2 outline-none focus:border-foreground"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setUsername("");
                  setPassword("");
                  setError("");
                }}
                className="flex-1 cursor-pointer rounded-xl border border-border py-2 transition-opacity hover:opacity-70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-foreground py-2 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? <PulseLoader color="white" size={5} /> : "Connect"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
