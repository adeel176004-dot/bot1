import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Activity, CreditCard, Loader2 } from 'lucide-react';

interface PaidUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  usage: number;
  createdAt: any;
}

export function AdminPanel() {
  const [users, setUsers] = useState<PaidUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: PaidUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({
            id: doc.id,
            email: data.email || 'N/A',
            name: data.name || 'Unknown',
            plan: data.plan || 'free',
            usage: data.usage || 0,
            createdAt: data.createdAt,
          });
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const paidUsers = users.filter(u => u.plan !== 'free').length;
  const totalUsage = users.reduce((acc, curr) => acc + curr.usage, 0);

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Users</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '-' : totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Paid Subscribers</h3>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '-' : paidUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Agent Usage</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '-' : totalUsage}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">User Subscriptions & Usage</h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Usage (mins)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.plan === 'premium' ? 'bg-indigo-100 text-indigo-800' : 
                          u.plan === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.usage}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
