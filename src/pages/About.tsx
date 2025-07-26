import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Truck, Shield } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Years of Excellence', value: '15+', icon: Award },
    { label: 'Daily Deliveries', value: '1,000+', icon: Truck },
    { label: 'Quality Guarantee', value: '100%', icon: Shield },
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      bio: 'With 20+ years in the meat industry, Rajesh founded MeatExpress to revolutionize how people buy fresh meat.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Priya Sharma',
      role: 'Quality Director',
      bio: 'Priya ensures every product meets our highest standards. She leads our quality assurance team.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Amit Patel',
      role: 'Operations Head',
      bio: 'Amit manages our supply chain and delivery operations, ensuring fresh products reach you on time.',
      image: '/api/placeholder/300/300'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">Our Story</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Delivering Freshness,
          <span className="text-primary"> Building Trust</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          For over 15 years, MeatExpress has been India's most trusted source for premium quality meat. 
          We believe in delivering not just products, but peace of mind to every family.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground text-lg mb-6">
            To provide the highest quality, freshest meat products while maintaining complete transparency 
            in our sourcing and handling processes. We're committed to supporting local farmers and 
            ensuring sustainable practices throughout our supply chain.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Direct partnerships with certified farms</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Temperature-controlled storage and delivery</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Rigorous quality testing at every stage</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>100% freshness guarantee with easy returns</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Why Choose MeatExpress?</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <span>FSSAI certified and HACCP compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-primary" />
              <span>Cold chain delivery within 2 hours</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-primary" />
              <span>Award-winning customer service</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary" />
              <span>Trusted by 50,000+ families</span>
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
            The passionate people behind MeatExpress who make freshness possible
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
            <h3 className="text-xl font-bold mb-3">Quality First</h3>
            <p className="text-muted-foreground">
              We never compromise on quality. Every product goes through multiple quality checks.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Transparency</h3>
            <p className="text-muted-foreground">
              Complete transparency in sourcing, processing, and delivery. Know exactly what you're buying.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Customer Care</h3>
            <p className="text-muted-foreground">
              Your satisfaction is our priority. We're here to serve you with dedication and respect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;