import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegistrationForm from "./RegistrationForm";

// Mock axios
jest.mock('axios');

describe("RegistrationForm / complete integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const fillValidForm = async () => {
    await userEvent.type(screen.getByLabelText("Prénom"), "Jone");
    await userEvent.type(screen.getByLabelText("Nom"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "jone@test.com");
    await userEvent.type(screen.getByLabelText("Date de naissance"), "1990-08-19");
    await userEvent.type(screen.getByLabelText("Ville"), "Nîmes");
    await userEvent.type(screen.getByLabelText("Code postal"), "30000-1234");
  };


  test("Should display error for invalid date", async () => {
    render(<RegistrationForm />);

    const birth = screen.getByLabelText("Date de naissance");

    await userEvent.type(birth, "2900-01-01"); // future date: calculateAge must throw
    await userEvent.tab();

    expect(
      screen.getByText("Il est impossible de renseigner une date de naissance dans le futur")
    ).toBeInTheDocument();
  });

  test("Soould affiche une erreur pour un code postal invalide", async () => {
    render(<RegistrationForm />);

    const postal = screen.getByLabelText("Code postal");

    await userEvent.type(postal, "abc");
    await userEvent.tab();

    expect(
      screen.getByText("Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789).")
    ).toBeInTheDocument();
  });

  test("Should the toaster disappears after 3 seconds", async () => {
    jest.useFakeTimers();
    render(<RegistrationForm />);

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "S'enregistrer" }));

    const toaster = screen.getByText("Utilisateur enregistré avec succès !");
    expect(toaster).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(toaster).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test("Should save errors to localStorage when submitting with invalid first name", async () => {
    render(<RegistrationForm />);
    
    // Fill the form with an invalid first name
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "123" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "1990-08-19" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_firstName")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });

  test("Should save errors to localStorage when submitting with invalid last name", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "456" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "1990-08-19" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_lastName")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });

  test("Should save errors to localStorage when submitting with invalid email", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "nullnull" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "1990-08-19" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_email")).toBe("Veuillez saisir une adresse email valide (test@test.com).");
  });

  test("Should save errors to localStorage when submitting with missing birthdate", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    // Do not fill in the birthdate
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_birth")).toBe("La date de naissance est obligatoire");
  });

  test("Should save errors to localStorage when submitting with future birthdate", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "2050-10-10" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_birth")).toBe("Il est impossible de renseigner une date de naissance dans le futur");
  });

  test("Should save errors to localStorage when submitting with invalid postal code", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "1990-08-19" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "Nîmes" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "abc" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_postalCode")).toBe("Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789).");
  });

  test("Should save errors to localStorage when submitting with invalid city", async () => {
    render(<RegistrationForm />);
    
    const form = screen.getByTestId("registration-form");
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { name: "firstName", value: "Jone" } });
    fireEvent.change(screen.getByLabelText("Nom"), { target: { name: "lastName", value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { name: "email", value: "jone@test.com" } });
    fireEvent.change(screen.getByLabelText("Date de naissance"), { target: { name: "birth", value: "1990-08-19" } });
    fireEvent.change(screen.getByLabelText("Ville"), { target: { name: "city", value: "789" } });
    fireEvent.change(screen.getByLabelText("Code postal"), { target: { name: "postalCode", value: "30000-1234" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("error_city")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });

  test("Should display real-time errors", async () => {
    render(<RegistrationForm />);

    const firstName = screen.getByLabelText("Prénom");

    // use invalide first name to trigger error
    await userEvent.type(firstName, "123");

    expect(
      screen.getByText("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.")
    ).toBeInTheDocument();

    await userEvent.clear(firstName);

    expect(
      screen.getByText("Le nom et prénom sont obligatoires et ne peuvent pas être vides.")
    ).toBeInTheDocument();
  });

  test("Should display error on blur if email is invalid", async () => {
    render(<RegistrationForm />);

    const email = screen.getByLabelText("Email");

    await userEvent.type(email, "invalid");
    await userEvent.tab(); // blur

    expect(
      screen.getByText("Veuillez saisir une adresse email valide (test@test.com).")
    ).toBeInTheDocument();
  });

  test("Should disable submit button when form is invalid", async () => {
    render(<RegistrationForm />);

    const button = screen.getByRole("button", { name: "S'enregistrer" });
    expect(button).toBeDisabled();

    await fillValidForm();

    expect(button).not.toBeDisabled();
  });

  test("Should submit valid form, display toaster, and call API through callback", async () => {
    const mockCallback = jest.fn();
    
    render(<RegistrationForm onRegistrationSuccess={mockCallback} />);

    await fillValidForm();

    await userEvent.click(screen.getByRole("button", { name: "S'enregistrer" }));

    expect(
      screen.getByText("Utilisateur enregistré avec succès !")
    ).toBeInTheDocument();

    expect(mockCallback).toHaveBeenCalledWith({
      name: "Jone Doe",
      email: "jone@test.com",
      address: {
        city: "Nîmes",
        zipcode: "30000-1234"
      },
      firstName: "Jone",
      lastName: "Doe",
      birth: "1990-08-19",
      city: "Nîmes",
      postalCode: "30000-1234"
    });

    expect(screen.getByLabelText("Prénom").value).toBe("");
  });

  test("Should clear localStorage errors after submit", async () => {
    render(<RegistrationForm />);

    await userEvent.type(screen.getByLabelText("Email"), "invalid");
    await userEvent.tab();

    expect(localStorage.getItem("error_email")).toBeTruthy();

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "S'enregistrer" }));

    expect(localStorage.getItem("error_email")).toBeNull();
  });

  
});

