const stats = [
  { value: "₹8L Cr", label: "India Fashion Market", sub: "Growing 20% yearly" },
  { value: "40%", label: "Average Return Rate", sub: "That we help eliminate" },
  { value: "50M+", label: "Online Shoppers", sub: "Potential users in India" },
  { value: "30s", label: "Try-On Speed", sub: "From photo to preview" },
];

const brands = ["Amazon", "Flipkart", "Myntra", "Meesho", "Shopify", "WooCommerce"];

export default function StatsSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="pill-blush mb-5 inline-flex">Market Opportunity</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            A <span className="gradient-text">₹8 Lakh Crore</span> Opportunity<br />
            Waiting to Be Transformed
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 bg-white rounded-[14px] border border-border hover:border-primary/20 transition-all hover:shadow-md group"
            >
              <div className="font-display text-4xl lg:text-5xl font-medium gradient-text mb-1.5 group-hover:scale-105 transition-transform inline-block">
                {stat.value}
              </div>
              <p className="font-body font-medium text-foreground text-sm mb-0.5">{stat.label}</p>
              <p className="font-body text-muted-foreground text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Integration strip */}
        <div className="text-center">
          <p className="font-body text-muted-foreground text-xs tracking-widest uppercase mb-6">
            Integrates with your favourite platforms
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand, i) => (
              <div
                key={i}
                className="px-5 py-2.5 bg-white border border-border rounded-full font-body font-medium text-foreground text-sm hover:border-gold/50 hover:text-gold-dark transition-all cursor-default shadow-soft"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
