const stats = [
  { value: "$100B+", label: "India Fashion Market", sub: "Growing 20% yearly" },
  { value: "40%", label: "Average Return Rate", sub: "That we help eliminate" },
  { value: "50M+", label: "Online Shoppers", sub: "Potential users in India" },
  { value: "30s", label: "Try-On Speed", sub: "From photo to outfit preview" },
];

const brands = ["Amazon", "Flipkart", "Myntra", "Meesho", "Shopify", "WooCommerce"];

export default function StatsSection() {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-body font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            Market Opportunity
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
            A <span className="gradient-text">₹8 Lakh Crore</span> Opportunity<br />
            Waiting to Be Transformed
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 bg-card rounded-3xl border border-border hover:border-primary/30 transition-all hover:shadow-brand group"
            >
              <div className="font-display text-5xl lg:text-6xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform inline-block">
                {stat.value}
              </div>
              <p className="font-body font-semibold text-foreground text-sm mb-1">{stat.label}</p>
              <p className="font-body text-muted-foreground text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Integration strip */}
        <div className="text-center">
          <p className="font-body text-muted-foreground text-sm tracking-widest uppercase mb-8">
            Integrates with your favourite platforms
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-card border border-border rounded-full font-body font-semibold text-foreground text-sm hover:border-gold hover:text-gold transition-all cursor-default"
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
