import { useEffect } from 'react'
import styles from './Legal.module.css'

export default function Terms() {
  useEffect(() => { document.title = 'Terms & Conditions — TransBridge Logistics' }, [])
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className='container'>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.updated}>Last updated: June 2026</p>
        </div>
      </div>
      <div className='container'>
        <div className={styles.content}>
          <p className={styles.intro}>
            By using TransBridge Logistics services, you agree to these Terms and Conditions.
            Please read them carefully before using our platform or booking a shipment.
          </p>

          {[
            {
              title: '1. Services',
              body: `TransBridge Logistics provides international freight forwarding and logistics services between the United Kingdom and Nigeria. Services include air freight, sea freight, door-to-door delivery, customs clearance, warehousing, and package consolidation.`,
            },
            {
              title: '2. Booking and Payment',
              body: `Shipments are confirmed upon receipt of payment or a signed quotation. Prices are subject to change based on fuel surcharges, currency fluctuations, and customs duties. All prices are exclusive of Nigerian import duties and taxes unless explicitly stated.`,
            },
            {
              title: '3. Prohibited Items',
              body: `You may not ship items that are illegal under UK or Nigerian law, including but not limited to: illegal drugs and substances, weapons and ammunition, counterfeit goods, live animals (without prior written agreement), hazardous materials, and perishable food items (without prior arrangement). TransBridge reserves the right to inspect and refuse any shipment at any time.`,
            },
            {
              title: '4. Liability',
              body: `TransBridge Logistics liability for loss or damage is limited to the declared value of the shipment, not exceeding £500 per shipment unless additional insurance is purchased. We are not liable for delays caused by customs authorities, adverse weather, civil unrest, or other factors beyond our reasonable control.`,
            },
            {
              title: '5. Customs Compliance',
              body: `The shipper is responsible for providing accurate and complete customs documentation. TransBridge will assist in the clearance process but bears no responsibility for delays or penalties resulting from inaccurate shipper declarations. Import duties assessed by Nigerian Customs are the sole responsibility of the consignee.`,
            },
            {
              title: '6. Delivery',
              body: `Estimated delivery times are not guaranteed and may be affected by customs clearance, public holidays, and logistics conditions. TransBridge will notify you of any significant delays via SMS and email. Proof of delivery will be obtained and shared via your dashboard.`,
            },
            {
              title: '7. Claims',
              body: `Claims for loss or damage must be submitted within 14 days of the expected delivery date. Claims must include the tracking number, description of loss or damage, photographs (where applicable), and supporting documentation. Claims are reviewed within 30 business days.`,
            },
            {
              title: '8. Account Responsibilities',
              body: `You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised use of your account. TransBridge is not liable for loss resulting from unauthorised account access where reasonable security measures were in place.`,
            },
            {
              title: '9. Governing Law',
              body: `These Terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales, except where mandatory local consumer protection laws apply.`,
            },
            {
              title: '10. Changes to Terms',
              body: `TransBridge may update these Terms at any time. Continued use of our services after changes constitutes acceptance. We will notify registered customers of material changes via email.`,
            },
            {
              title: '11. Contact',
              body: `For questions about these Terms: Transbridgelogistics01@gmail.com | +44 7934 219309`,
            },
          ].map(s => (
            <div key={s.title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{s.title}</h2>
              <p className={styles.sectionBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
