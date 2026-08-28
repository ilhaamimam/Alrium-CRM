import type {
  ReactNode,
} from "react";

import Sidebar
  from "./Sidebar";

import "./layout.css";


interface Props {
  children: ReactNode;
}


export default function AppLayout({
  children,
}: Props) {
  return (
    <div className="crm-layout">

      <Sidebar />

      <main className="crm-main">

        <div className="crm-content">

          {children}

        </div>

      </main>

    </div>
  );
}