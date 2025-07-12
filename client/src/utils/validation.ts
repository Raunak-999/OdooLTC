export function validateQuestion(title: string, description: string, tags: string[]) {
  const errors: { [key: string]: string } = {};

  if (!title.trim()) {
    errors.title = 'Title is required';
  } else if (title.trim().length < 10) {
    errors.title = 'Title must be at least 10 characters';
  } else if (title.trim().length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  if (!description.trim()) {
    errors.description = 'Description is required';
  } else if (description.trim().length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }

  if (tags.length === 0) {
    errors.tags = 'At least one tag is required';
  } else if (tags.length > 5) {
    errors.tags = 'Maximum 5 tags allowed';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAnswer(content: string) {
  const errors: { [key: string]: string } = {};

  if (!content.trim()) {
    errors.content = 'Answer content is required';
  } else if (content.trim().length < 10) {
    errors.content = 'Answer must be at least 10 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 6;
}

export function validateTag(tag: string) {
  const tagRegex = /^[a-zA-Z0-9-]+$/;
  return tag.length >= 2 && tag.length <= 20 && tagRegex.test(tag);
}
