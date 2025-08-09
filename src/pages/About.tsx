import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Truck, Shield } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Happy Customers', value: '100,000+', icon: Users },
    { label: 'Years of Excellence', value: '10+', icon: Award },
    { label: 'Daily Orders', value: '5,000+', icon: Truck },
    { label: 'Satisfaction Rate', value: '99%', icon: Shield },
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      bio: 'With 15+ years in e-commerce, Rajesh founded BulkBoxs to democratize bulk shopping and make wholesale prices accessible to everyone.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Priya Sharma',
      role: 'Supply Chain Director',
      bio: 'Priya manages our vast network of suppliers and ensures competitive pricing across all product categories.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Amit Patel',
      role: 'Operations Head',
      bio: 'Amit oversees our logistics and fulfillment operations, ensuring bulk orders are processed efficiently and delivered on time.',
      image: '/api/placeholder/300/300'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">Our Story</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Bulk Shopping Made Simple,
          <span className="text-primary"> Savings Made Real</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          For over 10 years, BulkBoxs has been revolutionizing how businesses and families shop. 
          We believe in delivering exceptional value through bulk purchasing power and wholesale prices.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground text-lg mb-6">
            To make bulk shopping accessible, affordable, and convenient for everyone. We leverage our buying power 
            to negotiate the best wholesale prices and pass those savings directly to our customers, whether they're 
            businesses, families, or individuals looking to save money.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Direct partnerships with manufacturers and wholesalers</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Efficient warehousing and logistics network</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Quality assurance across all product categories</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>100% satisfaction guarantee with hassle-free returns</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Why Choose BulkBoxs?</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <span>Verified suppliers and quality-assured products</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-primary" />
              <span>Free delivery on bulk orders above ₹2,000</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-primary" />
              <span>Best-in-class customer support</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary" />
              <span>Trusted by 100,000+ customers nationwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground text-lg">
            The dedicated professionals behind BulkBoxs who make bulk shopping simple and affordable
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                <p className="text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Value for Money</h3>
            <p className="text-muted-foreground">
              We negotiate the best wholesale prices and pass the savings directly to you. Maximum value, minimum cost.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Wide Selection</h3>
            <p className="text-muted-foreground">
              From groceries to electronics, home essentials to office supplies - find everything you need in one place.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Reliable Service</h3>
            <p className="text-muted-foreground">
              Consistent quality, on-time delivery, and responsive customer support. Your bulk shopping partner you can trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;