import React from 'react';
import { getStoredUser } from '../../services/auth';
import AdminQnaPanel from '../../components/qna/admin/AdminQnaPanel';
import UserQnaPanel from '../../components/qna/user/UserQnaPanel';
import { adminQnaApi } from '../../services/qna/adminQnaApi';
import { userQnaApi } from '../../services/qna/userQnaApi';

const QnaPage: React.FC = () => {
  const currentUser = getStoredUser();
  const role = currentUser?.role;
  const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-light serif text-white">의사결정 룸</h2>
        <p className="text-slate-400">Q&amp;A</p>
      </header>

      {isAdmin ? (
        <AdminQnaPanel api={adminQnaApi} />
      ) : (
        <UserQnaPanel api={userQnaApi} currentUser={currentUser} />
      )}
    </div>
  );
};

export default QnaPage;
