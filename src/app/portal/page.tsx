import { PortalPage } from "@/components/returns/PortalPage";

/**
 * The branded returns portal itself. The demo frames this route in an iframe so
 * the portal gets a real viewport (its fixed bars, vh sheets and lg: breakpoints
 * then behave exactly as designed, including in the mobile preview).
 * Can also be opened directly: /portal?store=yourstore.com
 */
export default function Portal() {
  return <PortalPage />;
}
